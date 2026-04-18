import type { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm registered={sp.registered === '1'} resetOk={sp.reset === '1'} />;
}
