import { NextRequest, NextResponse } from 'next/server';
import { STRAPI_JWT_COOKIE, STRAPI_REFRESH_COOKIE, STRAPI_REMEMBER_COOKIE } from '@/lib/auth/cookies';
import { runSingleFlightRefresh, isJwtExpired } from '@/lib/auth/session';

/**
 * Routes that require a valid session to access.
 * If unauthenticated, user will be redirected to the login page.
 */
const PROTECTED_ROUTES = ['/auth/change-password'];

/**
 * Next.js Proxy (Middleware)
 * Intercepts requests to handle silent token refreshing and route protection.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Extract credentials and locale from cookies
  const jwt = request.cookies.get(STRAPI_JWT_COOKIE)?.value;
  const refreshToken = request.cookies.get(STRAPI_REFRESH_COOKIE)?.value;
  const remember = request.cookies.get(STRAPI_REMEMBER_COOKIE)?.value === '1';
  const nextLocale = request.cookies.get('NEXT_LOCALE')?.value;

  let currentJwt = jwt;
  let rotatedRefreshToken: string | undefined;
  let detectedLocale = nextLocale;

  // 1b. Locale Detection (if not set in cookie)
  if (!detectedLocale) {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage?.toLowerCase().includes('ar')) {
      detectedLocale = 'ar';
    } else {
      detectedLocale = 'en'; // Default to English as per user request
    }
  }

  // 2. Token Lifetime Management (Silent Refresh)
  // If the JWT is missing or literally expired, we attempt to rotate it using the refresh token.
  const isExpired = !currentJwt || isJwtExpired(currentJwt);
  
  if (isExpired && refreshToken) {
    console.log(`[Proxy] Session expired. Attempting silent refresh for: ${pathname}`);
    
    const refresh = await runSingleFlightRefresh(refreshToken, remember);
    
    if (refresh?.jwt) {
      console.log(`[Proxy] Silent refresh successful.`);
      currentJwt = refresh.jwt;
      rotatedRefreshToken = refresh.refreshToken;
    } else {
      console.warn(`[Proxy] Silent refresh failed.`);
      currentJwt = undefined; // Token is truly invalid/expired
    }
  }

  const isAuthenticated = Boolean(currentJwt);

  // 3. Routing & Authorization Logic
  let response: NextResponse;
  const isProtected = PROTECTED_ROUTES.includes(pathname);
  const isAuthPage = ['/auth/login', '/auth/register'].includes(pathname);

  if (isProtected && !isAuthenticated) {
    console.log(`[Proxy] Access denied to protected route: ${pathname}`);
    response = NextResponse.redirect(new URL('/auth/login', request.nextUrl));
  } else if (isAuthPage && isAuthenticated) {
    console.log(`[Proxy] Authenticated user redirected from auth page: ${pathname}`);
    response = NextResponse.redirect(new URL('/', request.nextUrl));
  } else {
    // Normal request flow
    response = NextResponse.next();
  }

  // 4. Finalize Response (Persist Rotated Tokens)
  // If we successfully rotated the tokens, we must update the cookies in the response.
  if (currentJwt && currentJwt !== jwt) {
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    };

    response.cookies.set(STRAPI_JWT_COOKIE, currentJwt, cookieOptions);
    
    if (rotatedRefreshToken && rotatedRefreshToken !== refreshToken) {
      response.cookies.set(STRAPI_REFRESH_COOKIE, rotatedRefreshToken, cookieOptions);
    }
  }

  // 5. Persist Locale
  if (detectedLocale && detectedLocale !== nextLocale) {
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

/**
 * Configure which routes this proxy targets.
 * Excludes static assets and internal Next.js files for performance.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

export default proxy;
