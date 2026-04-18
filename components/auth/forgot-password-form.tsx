'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, MailCheck } from 'lucide-react';

import { AuthForm } from '@/components/auth/ui/auth-form';
import { buttonVariants } from '@/components/ui/button';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { forgotPasswordAction } from '@/lib/auth/actions';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/schemas';
import { cn } from '@/lib/utils';
import { initialAuthState } from '@/lib/auth/action-state';

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { errors } = form.formState;

  useEffect(() => {
    if (state.error) { setRootError(state.error); setSuccessMessage(null); return; }
    setRootError(null);
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs[0])
          form.setError(key as keyof ForgotPasswordInput, { message: msgs[0] });
      });
      return;
    }
    if (state.success || state.message) setSuccessMessage(state.success ?? state.message ?? null);
  }, [state, form]);

  const onSubmit = form.handleSubmit(values => {
    setRootError(null);
    setSuccessMessage(null);
    const fd = new FormData();
    fd.append('email', values.email);
    startTransition(() => formAction(fd));
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  if (successMessage) {
    return (
      <AuthForm>
        <AuthForm.Header
          icon={MailCheck}
          title="Check your inbox"
          description="If an account exists for that email, we've asked Strapi to send reset instructions. Follow the link in the message — it may take a minute to arrive."
        />
        <AuthForm.Footer>
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            Back to sign in
          </Link>
          <AuthForm.Separator />
          <AuthForm.Note>
            Wrong email?{' '}
            <button type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setSuccessMessage(null)}>
              Try again
            </button>
          </AuthForm.Note>
        </AuthForm.Footer>
      </AuthForm>
    );
  }

  return (
    <AuthForm onSubmit={onSubmit}>
      <AuthForm.Header
        icon={KeyRound}
        title="Forgot password"
        description={
          <>
            Enter the email on your account. Strapi sends the message. In Strapi Admin, allow{' '}
            <strong>forgotPassword</strong> for the <strong>Public</strong> role and point the reset
            URL at your Next.js app, for example{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-[0.65rem]">
              http://localhost:3000/auth/reset-password
            </code>
            .
          </>
        }
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-4">
            {rootError && <AuthForm.ErrorBanner message={rootError} />}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input id="forgot-email" type="email" autoComplete="email"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.email}
                {...form.register('email')} />
              <FieldError errors={[errors.email]} />
            </Field>
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel="Send reset link" isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/login', label: 'Sign in' },
          { href: '/auth/register', label: 'Create account' },
          { href: '/', label: 'Home' },
        ]} />
      </AuthForm.Footer>
    </AuthForm>
  );
}
