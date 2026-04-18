import type { Metadata } from 'next';

import { AuthShell } from '@/components/auth/ui/auth-form';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sign in, register, or reset your password',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
