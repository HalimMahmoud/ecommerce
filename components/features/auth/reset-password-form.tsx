// fallow-ignore-file duplication
'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';

import { AuthForm } from '@/components/features/auth/ui/auth-form';
import { PasswordFormFields } from '@/components/features/auth/ui/password-form-fields';
import { FieldGroup, FieldDescription } from '@/components/ui/field';
import { useTranslations } from 'next-intl';
import { resetPasswordAction } from '@/lib/auth/actions';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/auth/schemas';
import { initialAuthState } from '@/lib/auth/action-state';

type ResetPasswordFormProps = { defaultCode?: string };

export default function ResetPasswordForm({ defaultCode = '' }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const t = useTranslations('auth');

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: defaultCode, password: '', passwordConfirmation: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const password = form.watch('password');
  const passwordConfirmation = form.watch('passwordConfirmation');

  useEffect(() => {
    if (passwordConfirmation) void form.trigger('passwordConfirmation');
  }, [password, passwordConfirmation, form]);

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
    if (state.success) {
      form.reset();
    }
  }, [state, form]);

  // fallow-ignore-next-line duplication
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
        title={t('resetPasswordTitle')}
        description={t('resetPasswordDesc')}
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-6">
            {rootError && <AuthForm.ErrorBanner message={rootError} />}
            <input type="hidden" {...form.register('code')} />

            <PasswordFormFields prefix="reset-" />
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel={t('resetPassword')} isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/login', label: t('signInTitle') },
          { href: '/auth/forgot-password', label: t('forgotPassword') },
          { href: '/', label: t('backToHome') },
        ]} />
        <FieldDescription className="text-center text-[0.65rem]">
          {t('passwordUpdatedDesc')}
        </FieldDescription>
      </AuthForm.Footer>
    </AuthForm>
  );
}

