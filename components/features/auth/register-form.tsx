// fallow-ignore-file duplication
'use client';

import { useActionState, useState, startTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';

import { AuthForm } from '@/components/features/auth/ui/auth-form';
import { PasswordFormFields } from '@/components/features/auth/ui/password-form-fields';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('auth');

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', passwordConfirmation: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { errors } = form.formState;

  // Handle server action state synchronization
  useEffect(() => {
    if (state.error) setRootError(state.error);
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs[0]) {
          form.setError(key as any, { message: msgs[0] });
        }
      });
    }
    if (state.success || state.message) {
      const msg = state.success ?? state.message;
      if (msg) setSuccessMessage(msg);
      if (state.success) {
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
    fd.append('passwordConfirmation', values.passwordConfirmation);
    startTransition(() => formAction(fd));
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  return (
    <AuthForm onSubmit={onSubmit}>
      <AuthForm.Header
        icon={UserPlus}
        title={t('signUpTitle')}
        description={t('signUpDesc')}
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-6">
            {rootError && <AuthForm.ErrorBanner message={rootError} />}
            {successMessage && <AuthForm.SuccessBanner title={t('accountReady')} description={successMessage} />}

            <Field data-invalid={!!errors.username} className="space-y-2">
              <FieldLabel htmlFor="register-username">{t('username')}</FieldLabel>
              <Input id="register-username" type="text" autoComplete="username"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.username}
                {...form.register('username')} />
              <FieldError errors={[errors.username]} />
            </Field>

            <Field data-invalid={!!errors.email} className="space-y-2">
              <FieldLabel htmlFor="register-email">{t('email')}</FieldLabel>
              <Input id="register-email" type="email" autoComplete="email"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.email}
                {...form.register('email')} />
              <FieldError errors={[errors.email]} />
            </Field>

            <PasswordFormFields prefix="register-" />

            {state.rateLimited && (
              <p className="text-sm text-muted-foreground">
                {t('tooManyAttempts')}
              </p>
            )}
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel={t('signUpTitle')} isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/login', label: t('signInTitle') },
          { href: '/', label: t('backToHome') },
        ]} />
        <AuthForm.Note>
          {t('passwordHint')}
        </AuthForm.Note>
      </AuthForm.Footer>
    </AuthForm>
  );
}

