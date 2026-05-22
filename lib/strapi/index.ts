import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getValidStrapiJwt } from '../auth/session';
import { strapiBaseUrl } from './strapi-base-url';

// Extend Axios config interfaces with our custom properties (single declaration)
declare module 'axios' {
  interface AxiosRequestConfig {
    errorMsg?: string;
    successMsg?: string;
    requiresAuth?: boolean;
    _retry?: boolean;
  }
  interface InternalAxiosRequestConfig {
    errorMsg?: string;
    successMsg?: string;
    requiresAuth?: boolean;
    _retry?: boolean;
  }
}

interface StrapiErrorDetail {
  path?: string[];
  message?: string;
  name?: string;
}

interface StrapiErrorResponse {
  error?: {
    status?: number;
    name?: string;
    message?: string;
    details?: {
      errors?: StrapiErrorDetail[];
    };
  };
}

/**
 * Extracts a user-friendly error message from a Strapi error response.
 * Returns an object with the general error message and optionally field-specific errors.
 */
export function getStrapiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }

  const axiosError = error as AxiosError<StrapiErrorResponse>;
  const strapiError = axiosError.response?.data?.error;

  if (!strapiError) {
    return axiosError.message || 'A network error occurred';
  }

  // Strapi v5 error format: { error: { message: "...", details: { errors: [...] } } }
  let message = strapiError.message || 'An error occurred with Strapi';

  if (strapiError.details?.errors?.length) {
    // Sometimes details.errors is an array of more specific errors
    const firstError = strapiError.details.errors[0];
    if (firstError?.message) {
      message = firstError.message;
    }
  }

  return message;
}

/**
 * Extracts field-level validation errors from a Strapi error response.
 * Useful for mapping errors back to form fields.
 */
export function getStrapiFieldErrors(error: unknown): Record<string, string[]> | undefined {
  if (!axios.isAxiosError(error)) return undefined;

  const axiosError = error as AxiosError<StrapiErrorResponse>;
  const strapiError = axiosError.response?.data?.error;

  if (!strapiError || !strapiError.details?.errors) return undefined;

  const fieldErrors: Record<string, string[]> = {};

  strapiError.details.errors.forEach((err) => {
    if (err.path && err.path.length > 0) {
      const field = err.path[err.path.length - 1];
      if (field) {
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        if (err.message) {
          fieldErrors[field].push(err.message);
        }
      }
    }
  });

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

const strapi = axios.create({
  baseURL: strapiBaseUrl() || '',
  timeout: 30_000,
});

/**
 * REQUEST INTERCEPTOR — Auth injection
 *
 * Injects the JWT on every request by default.
 *
 * How it works:
 *   - Reads the JWT from the httpOnly session cookie via getValidStrapiJwt()
 *   - If the cookie is present and valid → sets Authorization: Bearer <token>
 *   - If the cookie is missing or cleared (e.g. after logout) → skips the header
 *     → Strapi returns 401 → response interceptor below handles cleanup
 *
 * To skip auth for a specific call (e.g. public endpoints):
 *   strapi.get('/api/products', { requiresAuth: false })
 *
 * Note: The cookie is read fresh on every request — there is no caching here.
 * So the moment clearStrapiSession() deletes the cookie, the very next Axios
 * call will have no token and will get a 401 from Strapi.
 */
strapi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Opt-out: only skip auth when caller explicitly sets requiresAuth: false
  if (config.requiresAuth === false) return config;

  const jwt = await getValidStrapiJwt();
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

/**
 * RESPONSE INTERCEPTOR — 401 / session cleanup
 *
 * What happens when the cookie is gone or token is expired:
 *   1. Strapi returns 401 Unauthorized
 *   2. This interceptor catches it and clears the local session cookie
 *      (in case it exists but is stale/expired)
 *   3. Re-throws the error so the calling server action can return
 *      a user-friendly { error: 'Session expired. Please log in again.' }
 *
 * This means each individual action does NOT need to handle 401 logic —
 * it's centralised here.
 */
strapi.interceptors.response.use(
  response => {
    if (response.config.successMsg && response.data) {
      response.data.message = response.config.successMsg;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const { runSingleFlightRefresh } = await import('../auth/session');
        const refreshResult = await runSingleFlightRefresh();

        if (refreshResult?.jwt) {
          // Update the Authorization header and retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshResult.jwt}`;
          }
          return strapi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Interceptor refresh failed:', refreshError);
      }

      // If refresh failed or returned no JWT, clear session and reject
      try {
        const { clearStrapiSession } = await import('../auth/session');
        await clearStrapiSession();
      } catch {
        // Safe no-op
      }
    }

    return Promise.reject(error);
  }
);

export default strapi;
