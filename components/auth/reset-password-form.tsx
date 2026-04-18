'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';

import { AuthForm } from '@/components/auth/ui/auth-form';
import PasswordStrengthMeter from '@/components/auth/password-strength-meter';
import { FieldGroup, FieldDescription, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { resetPasswordAction } from '@/lib/auth/actions';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/auth/schemas';
import { initialAuthState } from '@/lib/auth/action-state';

type ResetPasswordFormProps = { defaultCode?: string };

export default function ResetPasswordForm({ defaultCode = '' }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: defaultCode, password: '', passwordConfirmation: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { errors } = form.formState;
  const password = form.watch('password');
  const passwordConfirmation = form.watch('passwordConfirmation');

  useEffect(() => {
    if (passwordConfirmation) void form.trigger('passwordConfirmation');
  }, [password, passwordConfirmation, form]);

  useEffect(() => {
    if (state.error) { setRootError(state.error); return; }
    setRootError(null);
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs[0])
          form.setError(key as keyof ResetPasswordInput, { message: msgs[0] });
      });
    }
  }, [state, form]);

  const onSubmit = form.handleSubmit(values => {
    setRootError(null);
    const fd = new FormData();
    fd.append('code', values.code);
    fd.append('password', values.password);
    fd.append('passwordConfirmation', values.passwordConfirmation);
    startTransition(() => formAction(fd));
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  return (
    <AuthForm onSubmit={onSubmit}>
      <AuthForm.Header
        icon={Lock}
        title="Set a new password"
        description={
          <>
            This page uses the reset token from the link you opened (same value Strapi stores as{' '}
            <code className="rounded bg-muted px-1 text-[0.65rem]">resetPasswordToken</code>). In
            Strapi → Roles → <strong>Public</strong>, allow <strong>resetPassword</strong>. Password
            must match confirmation.
          </>
        }
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-4">
            {rootError && <AuthForm.ErrorBanner message={rootError} />}
            <input type="hidden" {...form.register('code')} />

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="reset-password">New password</FieldLabel>
              <Input id="reset-password" type="password" autoComplete="new-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.password}
                {...form.register('password')} />
              <FieldError errors={[errors.password]} />
              <PasswordStrengthMeter password={password} />
            </Field>

            <Field data-invalid={!!errors.passwordConfirmation}>
              <FieldLabel htmlFor="reset-confirm">Confirm new password</FieldLabel>
              <Input id="reset-confirm" type="password" autoComplete="new-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.passwordConfirmation}
                {...form.register('passwordConfirmation')} />
              <FieldError errors={[errors.passwordConfirmation]} />
            </Field>
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel="Update password" isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/login', label: 'Sign in' },
          { href: '/auth/forgot-password', label: 'Request new link' },
          { href: '/', label: 'Home' },
        ]} />
        <FieldDescription className="text-center text-[0.65rem]">
          After updating, you&apos;ll be redirected to sign in with your new password.
        </FieldDescription>
      </AuthForm.Footer>
    </AuthForm>
  );
}
