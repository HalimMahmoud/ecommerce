'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';

import { AuthForm } from '@/components/features/auth/ui/auth-form';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { loginAction } from '@/lib/auth/actions';
import { loginSchema } from '@/lib/auth/schemas';
import { initialAuthState } from '@/lib/auth/action-state';

interface LoginFormProps {
  registered?: boolean;
  resetOk?: boolean;
}

export default function LoginForm({ registered, resetOk }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [state, formAction, isPending] = useActionState(loginAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const t = useTranslations('auth');

  const form = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: false },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { errors } = form.formState;
  const remember = form.watch('remember');

  useEffect(() => {
    if (state.error) { setRootError(state.error); return; }
    setRootError(null);
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs[0])
          form.setError(key as keyof z.input<typeof loginSchema>, { message: msgs[0] });
      });
      return;
    }
    if (state.success) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, form, router, redirectTo]);

  const onSubmit = form.handleSubmit(values => {
    setRootError(null);
    const fd = new FormData();
    fd.append('identifier', values.identifier);
    fd.append('password', values.password);
    fd.append('remember', String(values.remember));
    startTransition(() => formAction(fd));
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  return (
    <AuthForm onSubmit={onSubmit}>
      <AuthForm.Header
        icon={LogIn}
        title={t('signInTitle')}
        description={t('signInDesc')}
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-6">
            {registered && (
              <AuthForm.SuccessBanner
                title={t('accountReady')}
                description={t('accountReadyDesc')}
              />
            )}
            {resetOk && (
              <AuthForm.SuccessBanner title={t('passwordUpdated')} description={t('passwordUpdatedDesc')} />
            )}
            {rootError && <AuthForm.ErrorBanner message={rootError === 'Invalid identifier or password' ? t('invalidCredentials') : rootError} />}

            <Field data-invalid={!!errors.identifier} className="space-y-2">
              <FieldLabel htmlFor="login-identifier">{t('emailOrUsername')}</FieldLabel>
              <Input id="login-identifier" type="text" autoComplete="username"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.identifier}
                {...form.register('identifier', { required: true })} />
              <FieldError errors={[errors.identifier]} />
            </Field>

            <Field data-invalid={!!errors.password} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="login-password">{t('password')}</FieldLabel>
                <Link href="/auth/forgot-password"
                  className="text-[0.7rem] font-medium text-primary underline-offset-4 hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input id="login-password" type="password" autoComplete="current-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.password}
                {...form.register('password', { required: true })} />
              <FieldError errors={[errors.password]} />
            </Field>

            <div className="flex items-center gap-2">
              <Checkbox id="login-remember" checked={remember}
                onCheckedChange={checked => form.setValue('remember', Boolean(checked))} />
              <Label htmlFor="login-remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t('rememberMe')}
              </Label>
            </div>

            {state.rateLimited && (
              <p className="text-sm text-muted-foreground">
                {t('tooManyAttempts')}
              </p>
            )}
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel={t('signInTitle')} isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/register', label: t('createAccount') },
          { href: '/auth/forgot-password', label: t('resetPassword') },
          { href: '/', label: t('backToHome') },
        ]} />
        <AuthForm.Note>
          {t('agreeTerms')}
        </AuthForm.Note>
      </AuthForm.Footer>
    </AuthForm>
  );
}

