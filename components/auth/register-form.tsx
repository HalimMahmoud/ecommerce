'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';

import { AuthForm } from '@/components/auth/ui/auth-form';
import PasswordStrengthMeter from '@/components/auth/password-strength-meter';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerAction } from '@/lib/auth/actions';
import { registerSchema, type RegisterInput } from '@/lib/auth/schemas';
import { initialAuthState } from '@/lib/auth/action-state';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [state, formAction, isPending] = useActionState(registerAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { errors } = form.formState;
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  useEffect(() => {
    if (confirmPassword) void form.trigger('confirmPassword');
  }, [password, confirmPassword, form]);

  useEffect(() => {
    if (state.error) { setRootError(state.error); setSuccessMessage(null); return; }
    setRootError(null);
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs[0])
          form.setError(key as keyof RegisterInput, { message: msgs[0] });
      });
      return;
    }
    if (state.success || state.message) {
      setSuccessMessage(state.success ?? state.message ?? null);
      if (state.success) {
        // Delay slightly if showing success message, or redirect immediately
        const timer = setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [state, form, router, redirectTo]);

  const onSubmit = form.handleSubmit(values => {
    setRootError(null);
    setSuccessMessage(null);
    const fd = new FormData();
    fd.append('username', values.username);
    fd.append('email', values.email);
    fd.append('password', values.password);
    fd.append('confirmPassword', values.confirmPassword);
    startTransition(() => formAction(fd));
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  return (
    <AuthForm onSubmit={onSubmit}>
      <AuthForm.Header
        icon={UserPlus}
        title="Create account"
        description="Join Gulf Store with a Strapi user — same credentials power your profile and checkout."
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-4">
            {rootError && <AuthForm.ErrorBanner message={rootError} />}
            {successMessage && <AuthForm.SuccessBanner title="Account ready" description={successMessage} />}

            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="register-username">Username</FieldLabel>
              <Input id="register-username" type="text" autoComplete="username"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.username}
                {...form.register('username')} />
              <FieldError errors={[errors.username]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input id="register-email" type="email" autoComplete="email"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.email}
                {...form.register('email')} />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input id="register-password" type="password" autoComplete="new-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.password}
                {...form.register('password')} />
              <FieldError errors={[errors.password]} />
              <PasswordStrengthMeter password={password} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="register-confirm">Confirm password</FieldLabel>
              <Input id="register-confirm" type="password" autoComplete="new-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.confirmPassword}
                {...form.register('confirmPassword')} />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            {state.rateLimited && (
              <p className="text-sm text-muted-foreground">
                Too many attempts? Wait a few minutes before trying again.
              </p>
            )}
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel="Create account" isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/login', label: 'Sign in' },
          { href: '/', label: 'Home' },
        ]} />
        <AuthForm.Note>
          Password must be at least 8 characters. Strapi users-permissions rules apply.
        </AuthForm.Note>
      </AuthForm.Footer>
    </AuthForm>
  );
}
