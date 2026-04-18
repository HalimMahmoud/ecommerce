import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token?: string; resetPasswordToken?: string }>;
}) {
  const sp = await searchParams;
  const code = sp.code ?? sp.token ?? sp.resetPasswordToken ?? '';
  return <ResetPasswordForm defaultCode={code} />;
}
