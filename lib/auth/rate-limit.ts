/**
 * Simple in-memory rate limiter for auth endpoints
 * For production, use Redis or a similar distributed store
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const AUTH_RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 registrations per hour
  forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  resetPassword: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  refresh: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 refreshes per minute
};

export type RateLimitAction = keyof typeof AUTH_RATE_LIMITS;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // Seconds until retry is allowed
}

export function checkRateLimit(identifier: string, action: RateLimitAction): RateLimitResult {
  // Bypassing rate limits for E2E tests in development/test environments
  // Bypass for E2E tests in development
  if (process.env.NODE_ENV !== 'production') {
    const isTest = identifier.startsWith('e2e_') || 
                   identifier.startsWith('test:') || 
                   identifier.includes(':test:') ||
                   identifier.includes(':e2e_');
                   
    if (isTest) {
      return { success: true, remaining: 999, resetAt: Date.now() + 1000 };
    }
  }
  const config = AUTH_RATE_LIMITS[action];
  if (!config) {
    // Default config if action not found
    return { success: true, remaining: Infinity, resetAt: Infinity };
  }

  const key = `${action}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  // No entry or expired entry
  if (!entry || entry.resetAt < now) {
    const newEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get a unique identifier for rate limiting
 * Uses a combination of IP and a hash
 */
export function getRateLimitIdentifier(request: Request): string {
  // Allow E2E tests to use a unique identifier to avoid IP-based collisions
  const testId = request.headers.get('x-test-id');
  if (testId && process.env.NODE_ENV !== 'production') return `test:${testId}`;

  const forwarded = request.headers.get('x-forwarded-for');
  const parts = forwarded?.split(',');
  const ip = parts && parts[0] ? parts[0].trim() : 'unknown';
  const userAgent = (request.headers.get('user-agent') || 'unknown').slice(0, 50);

  // Create a simple hash of IP + user agent
  const combined = `${ip}:${userAgent}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const charCode = combined.charCodeAt(i);
    if (charCode) {
      hash = ((hash << 5) - hash + charCode) | 0;
    }
  }

  return `req:${Math.abs(hash)}`;
}
