import type { AuthUser } from '@/lib/auth/types';

export function authDisplayName(user: AuthUser): string {
  const u = user.username.trim();
  if (u.length > 0) return u;
  const email = user.email.trim();
  if (!email) return 'Account';
  const local = email.split('@')[0]?.trim();
  return local && local.length > 0 ? local : email;
}
