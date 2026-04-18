export type AuthState = {
  error: string | null;
  success: string | null;
  message: string | null;
  fieldErrors: Record<string, string[]> | null;
  rateLimited: boolean;
  retryAfter: number | null;
};

export const initialAuthState: AuthState = {
  error: null,
  success: null,
  message: null,
  fieldErrors: null,
  rateLimited: false,
  retryAfter: null,
};
