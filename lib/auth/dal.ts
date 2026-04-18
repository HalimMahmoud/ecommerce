import 'server-only';

import { cache } from 'react';
import strapi from '@/lib/strapi';
import { getValidStrapiJwt, runSingleFlightRefresh, clearStrapiSession } from './session';
import type { AuthUser } from './types';

/** Normalize Strapi v4 (nested attributes) and v5 (flat) response shapes into AuthUser. */
function parseUser(raw: any): AuthUser {
  if (raw.data?.attributes) {
    return { id: raw.data.id, username: raw.data.attributes.username, email: raw.data.attributes.email };
  }
  return { id: raw.id, username: raw.username, email: raw.email };
}

async function fetchMe(): Promise<AuthUser | null> {
  // Authorization header is injected automatically by the request interceptor.
  const { data } = await strapi.get('/api/users/me');
  return parseUser(data);
}

/**
 * Fetch the currently authenticated user.
 * Cached per request so multiple server components calling getUser() hit Strapi only once.
 *
 * On 401: attempts a silent token refresh before giving up.
 * This handles clock-skew where the JWT looked valid locally but Strapi rejected it.
 */
export const getUser = cache(async (): Promise<AuthUser | null> => {
  const jwt = await getValidStrapiJwt();
  if (!jwt) return null;

  try {
    return await fetchMe();
  } catch (error: any) {
    if (error.response?.status === 401) {
      // JWT was rejected — attempt one silent refresh before logging the user out.
      const refreshed = await runSingleFlightRefresh();
      if (refreshed?.jwt) {
        try {
          return await fetchMe();
        } catch {
          await clearStrapiSession();
          return null;
        }
      }
      await clearStrapiSession();
    }
    return null;
  }
});
