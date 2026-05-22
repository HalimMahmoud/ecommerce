'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import strapi, { getStrapiError, getStrapiFieldErrors } from '@/lib/strapi';
import { getUser } from './dal';
import { setStrapiSession, clearStrapiSession } from './session';
import { checkRateLimit, getRateLimitIdentifier } from './rate-limit';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './schemas';
import type { AuthState } from './action-state';
import type { AuthUser } from './types';

function toAuthState(result: Partial<AuthState>): AuthState {
  return {
    error: result.error ?? null,
    success: result.success ?? null,
    message: result.message ?? null,
    fieldErrors: result.fieldErrors === undefined ? null : result.fieldErrors,
    rateLimited: result.rateLimited ?? false,
    retryAfter: result.retryAfter ?? null,
  };
}

async function getRequestFromHeaders() {
  const headersList = await headers();
  const cookie = headersList.get('cookie') || '';

  return new Request('https://example.com', {
    headers: {
      cookie,
      'user-agent': headersList.get('user-agent') || '',
      'x-forwarded-for': headersList.get('x-forwarded-for') || '',
      'x-test-id': headersList.get('x-test-id') || '',
    },
  });
}

export async function loginAction(
  _prevState: AuthState | null,
  data: FormData
): Promise<AuthState> {
  const request = await getRequestFromHeaders();
  const identifier = getRateLimitIdentifier(request);
  const rateLimit = checkRateLimit(identifier, 'login');

  if (!rateLimit.success) {
    return toAuthState({
      error: `Too many login attempts. Please try again in ${Math.ceil((rateLimit.retryAfter || 0) / 60)} minutes.`,
      rateLimited: true,
      retryAfter: rateLimit.retryAfter ?? null,
    });
  }

  const rawData = {
    identifier: data.get('identifier') as string,
    password: data.get('password') as string,
    remember: data.get('remember') === 'true' || data.get('remember') === 'on',
  };

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return toAuthState({
      fieldErrors: validated.error.flatten().fieldErrors,
    });
  }

  try {
    const { data: responseData } = await strapi.post(
      '/api/auth/local',
      { identifier: validated.data.identifier, password: validated.data.password },
      { requiresAuth: false } // public endpoint — no JWT needed
    );

    if (!responseData.jwt || !responseData.refreshToken) {
      return toAuthState({ error: 'Authentication failed. Please check your credentials.' });
    }

    await setStrapiSession(responseData.jwt, responseData.refreshToken, {
      remember: validated.data.remember,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'NEXT_REDIRECT') throw error;
    return toAuthState({
      error: getStrapiError(error),
      fieldErrors: getStrapiFieldErrors(error) ?? null,
    });
  }

  redirect('/');
}

export async function registerAction(
  _prevState: AuthState | null,
  data: FormData
): Promise<AuthState> {
  const request = await getRequestFromHeaders();
  const identifier = getRateLimitIdentifier(request);
  const rateLimit = checkRateLimit(identifier, 'register');

  if (!rateLimit.success) {
    return toAuthState({
      error: 'Too many registration attempts. Please try again later.',
      rateLimited: true,
      retryAfter: rateLimit.retryAfter ?? null,
    });
  }

  const rawData = {
    username: data.get('username') as string,
    email: data.get('email') as string,
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
  };

  const validated = registerSchema.safeParse(rawData);

  if (!validated.success) {
    return toAuthState({
      fieldErrors: validated.error.flatten().fieldErrors,
    });
  }

  try {
    const { data: responseData } = await strapi.post(
      '/api/auth/local/register',
      { username: validated.data.username, email: validated.data.email, password: validated.data.password },
      { requiresAuth: false } // public endpoint — no JWT needed
    );

    if (!responseData.jwt || !responseData.refreshToken) {
      // Strapi can be configured to require email confirmation before issuing tokens.
      return toAuthState({ message: 'Registration successful. Please check your email to confirm your account.' });
    }

    await setStrapiSession(responseData.jwt, responseData.refreshToken);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'NEXT_REDIRECT') throw error;
    return toAuthState({
      error: getStrapiError(error),
      fieldErrors: getStrapiFieldErrors(error) ?? null,
    });
  }

  redirect('/');
}

export async function logoutAction() {
  await clearStrapiSession();
}

export async function forgotPasswordAction(
  _prevState: AuthState | null,
  data: FormData
): Promise<AuthState> {
  const request = await getRequestFromHeaders();
  const identifier = getRateLimitIdentifier(request);
  const rateLimit = checkRateLimit(identifier, 'forgotPassword');

  if (!rateLimit.success) {
    return toAuthState({
      error: 'Too many password reset attempts. Please try again later.',
      rateLimited: true,
      retryAfter: rateLimit.retryAfter ?? null,
    });
  }

  const rawData = {
    email: data.get('email') as string,
  };

  const validated = forgotPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return toAuthState({
      fieldErrors: validated.error.flatten().fieldErrors,
    });
  }

  try {
    await strapi.post('/api/auth/forgot-password', validated.data, {
      requiresAuth: false, // public endpoint — no JWT needed
    });
  } catch {
    // Don't reveal if email exists or not for security
  }

  return toAuthState({
    success: 'If an account exists with this email, you will receive reset instructions.',
  });
}

export async function resetPasswordAction(
  _prevState: AuthState | null,
  data: FormData
): Promise<AuthState> {
  const request = await getRequestFromHeaders();
  const identifier = getRateLimitIdentifier(request);
  const rateLimit = checkRateLimit(identifier, 'resetPassword');

  if (!rateLimit.success) {
    return toAuthState({
      error: 'Too many password reset attempts. Please try again later.',
      rateLimited: true,
      retryAfter: rateLimit.retryAfter ?? null,
    });
  }

  const rawData = {
    code: data.get('code') as string,
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
  };

  const validated = resetPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return toAuthState({
      fieldErrors: validated.error.flatten().fieldErrors,
    });
  }

  try {
    await strapi.post(
      '/api/auth/reset-password',
      { code: validated.data.code, password: validated.data.password, passwordConfirmation: validated.data.passwordConfirmation },
      { requiresAuth: false } // public endpoint — no JWT needed (uses one-time code)
    );
  } catch (error: any) {
    if (error?.digest?.includes('NEXT_REDIRECT')) throw error;
    return toAuthState({
      error: getStrapiError(error),
      fieldErrors: getStrapiFieldErrors(error) ?? null,
    });
  }

  redirect('/auth/login?reset=1');
}

export async function changePasswordAction(
  _prevState: AuthState | null,
  data: FormData
): Promise<AuthState> {
  const rawData = {
    currentPassword: data.get('currentPassword') as string,
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
  };

  const validated = changePasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return toAuthState({
      fieldErrors: validated.error.flatten().fieldErrors,
    });
  }

  try {
    await strapi.post('/api/auth/change-password', {
      currentPassword: validated.data.currentPassword,
      password: validated.data.password,
      passwordConfirmation: validated.data.passwordConfirmation,
    });
  } catch (error: unknown) {
    return toAuthState({
      error: getStrapiError(error),
      fieldErrors: getStrapiFieldErrors(error) ?? null,
    });
  }

  return toAuthState({ success: 'Your password was updated successfully.' });
}

export async function getMeAction(): Promise<AuthUser | null> {
  return await getUser();
}
