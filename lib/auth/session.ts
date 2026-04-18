import { cookies } from 'next/headers';
import { strapiBaseUrl } from '../strapi/strapi-base-url';
import { STRAPI_JWT_COOKIE, STRAPI_REFRESH_COOKIE, STRAPI_REMEMBER_COOKIE } from './cookies';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Write all three auth cookies atomically.
 * With remember-me: 30-day persistent cookies survive browser restarts.
 * Without remember-me: session cookies — deleted when the browser is closed.
 */
export async function setStrapiSession(
  jwt: string,
  refreshToken: string,
  options?: { remember?: boolean }
) {
  const jar = await cookies();
  const remember = options?.remember ?? false;
  // Session cookies have no maxAge — browser deletes them on close.
  const opts = remember ? { ...COOKIE_OPTS, maxAge: THIRTY_DAYS } : COOKIE_OPTS;

  jar.set(STRAPI_JWT_COOKIE, jwt, opts);
  jar.set(STRAPI_REFRESH_COOKIE, refreshToken, opts);
  jar.set(STRAPI_REMEMBER_COOKIE, remember ? '1' : '0', opts);
}

/** Remove all auth cookies — called on logout or session invalidation. */
export async function clearStrapiSession() {
  const jar = await cookies();
  jar.delete(STRAPI_JWT_COOKIE);
  jar.delete(STRAPI_REFRESH_COOKIE);
  jar.delete(STRAPI_REMEMBER_COOKIE);
}

/** Raw JWT string from the cookie jar, or null if absent. */
export async function getStrapiJwt(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(STRAPI_JWT_COOKIE)?.value ?? null;
}

/** Raw refresh token from the cookie jar, or null if absent. */
export async function getStrapiRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(STRAPI_REFRESH_COOKIE)?.value ?? null;
}

/** Whether the user chose "remember me" so token rotation preserves the longer lifetime. */
export async function getRememberPreference(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(STRAPI_REMEMBER_COOKIE)?.value === '1';
}

/**
 * Decode the JWT payload and check the `exp` claim.
 * Treats the token as expired 10 seconds early to avoid race conditions.
 */
export function isJwtExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const padded = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    if (!decoded.exp) return true;
    return decoded.exp * 1000 <= Date.now() + 10_000;
  } catch {
    return true;
  }
}

/**
 * Main entry point for getting a usable JWT.
 * Returns the stored JWT if still valid, otherwise triggers a silent token refresh.
 * Returns null only if both the JWT and the refresh token are missing or invalid.
 */
export async function getValidStrapiJwt(): Promise<string | null> {
  const jwt = await getStrapiJwt();
  if (jwt && !isJwtExpired(jwt)) return jwt;

  const result = await runSingleFlightRefresh();
  return result?.jwt ?? null;
}

/** True when either JWT or refresh token exists — used by middleware for route guards. */
export async function hasValidSession(): Promise<boolean> {
  const jwt = await getStrapiJwt();
  const refreshToken = await getStrapiRefreshToken();
  return !!(jwt || refreshToken);
}

// In-flight refresh promise — shared across concurrent callers to avoid duplicate refresh requests.
let refreshPromise: Promise<{ jwt: string; refreshToken?: string } | null> | null = null;

/**
 * Deduplicated refresh: if a refresh is already in progress, all callers await the same promise
 * instead of sending multiple requests to Strapi simultaneously.
 * @param providedRefreshToken (Optional) Refresh token from middleware/req
 * @param providedRemember (Optional) Remember preference from middleware/req
 */
export async function runSingleFlightRefresh(
  providedRefreshToken?: string,
  providedRemember?: boolean
): Promise<{ jwt: string; refreshToken?: string } | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = performTokenRefresh(providedRefreshToken, providedRemember);
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Exchange the refresh token for a new JWT (and possibly a new refresh token).
 * Writes the rotated tokens back to cookies on success unless tokens were provided (Middleware).
 * Clears the session on failure so stale cookies don't linger.
 */
async function performTokenRefresh(
  providedRefreshToken?: string,
  providedRemember?: boolean
): Promise<{ jwt: string; refreshToken?: string } | null> {
  let refreshToken = providedRefreshToken || null;
  
  if (!refreshToken) {
    try {
      refreshToken = await getStrapiRefreshToken();
      console.log(`[Session] Refreshing using cookie token: ${refreshToken?.slice(0, 10)}...`);
    } catch {
      // cookies() failed likely in middleware, or simply missing
      return null;
    }
  }

  if (!refreshToken) return null;

  try {
    let lastError = null;
    let response = null;
    
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`[Session] Fetching Strapi refresh at ${strapiBaseUrl()}/api/auth/refresh`);
        response = await fetch(`${strapiBaseUrl()}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          signal: AbortSignal.timeout(10000),
        });
        console.log(`[Session] Strapi response status: ${response.status}`);
        if (response.ok || response.status !== 502) break;
      } catch (err) {
        console.error(`[Session] Fetch error (attempt ${i+1}):`, err);
        lastError = err;
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (!response || !response.ok) {
      console.error('Refresh failed after retries:', lastError || response?.statusText);
      // Only clear session if we are in server context (non-middleware)
      if (!providedRefreshToken) {
        try { await clearStrapiSession(); } catch {}
      }
      return null;
    }

    const data = await response.json();
    if (!data.jwt) return null;

    // If tokens were NOT provided, we are in a server context where we should write cookies.
    if (!providedRefreshToken) {
      const remember = providedRemember ?? await getRememberPreference();
      await setStrapiSession(data.jwt, data.refreshToken ?? refreshToken, { remember });
    }

    return { jwt: data.jwt, refreshToken: data.refreshToken ?? refreshToken };
  } catch {
    if (!providedRefreshToken) {
      try { await clearStrapiSession(); } catch {}
    }
    return null;
  }
}
