// fallow-ignore-file duplication
'use client';

import { useActionState, useState, startTransition, useEffect } from 'react';
import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, MailCheck } from 'lucide-react';

import { AuthForm } from '@/components/features/auth/ui/auth-form';
import { buttonVariants } from '@/components/ui/button';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { forgotPasswordAction } from '@/lib/auth/actions';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/schemas';
import { cn } from '@/lib/utils';
import { initialAuthState } from '@/lib/auth/action-state';

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const t = useTranslations('auth');

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
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
      if (msg) {
        setSuccessMessage(msg);
        form.reset();
      }
    }
  }, [state, form]);

  // fallow-ignore-next-line duplication
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
          title={t('forgotPasswordTitle')}
          description={t('accountReadyDesc')}
        />
        <AuthForm.Footer>
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            {t('signInTitle')}
          </Link>
          <AuthForm.Separator />
          <AuthForm.Note>
            {t('wrongEmail')}{' '}
            <button type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setSuccessMessage(null)}>
              {t('retry')}
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
        title={t('forgotPasswordTitle')}
        description={t('forgotPasswordDesc')}
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-6">
            {rootError && <AuthForm.ErrorBanner message={rootError} />}
            <Field data-invalid={!!errors.email} className="space-y-2">
              <FieldLabel htmlFor="forgot-email">{t('email')}</FieldLabel>
              <Input id="forgot-email" type="email" autoComplete="email"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.email}
                {...form.register('email')} />
              <FieldError errors={[errors.email]} />
            </Field>
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel={t('resetPassword')} isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/login', label: t('signInTitle') },
          { href: '/auth/register', label: t('createAccount') },
          { href: '/', label: t('backToHome') },
        ]} />
      </AuthForm.Footer>
    </AuthForm>
  );
}

