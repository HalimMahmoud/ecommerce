// fallow-ignore-file duplication
'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';

import { AuthForm } from '@/components/features/auth/ui/auth-form';
import { PasswordFormFields } from '@/components/features/auth/ui/password-form-fields';
import { FieldGroup, FieldDescription, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { changePasswordAction } from '@/lib/auth/actions';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/auth/schemas';
import { initialAuthState } from '@/lib/auth/action-state';

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const t = useTranslations('auth');

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', passwordConfirmation: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { errors } = form.formState;
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
    fd.append('currentPassword', values.currentPassword);
    fd.append('password', values.password);
    fd.append('passwordConfirmation', values.passwordConfirmation);
    startTransition(() => formAction(fd));
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  return (
    <AuthForm onSubmit={onSubmit}>
      <AuthForm.Header
        icon={KeyRound}
        title={t('changePasswordTitle')}
        description={t('changePasswordDesc')}
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-6">
            {successMessage && <AuthForm.SuccessBanner title={t('passwordUpdated')} description={successMessage} />}
            {rootError && <AuthForm.ErrorBanner message={rootError} />}

            <Field data-invalid={!!errors.currentPassword} className="space-y-2">
              <FieldLabel htmlFor="change-current-password">{t('currentPassword')}</FieldLabel>
              <Input id="change-current-password" type="password" autoComplete="current-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.currentPassword}
                {...form.register('currentPassword')} />
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <PasswordFormFields prefix="change-" />
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel={t('resetPassword')} isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/', label: t('backToHome') },
          { href: '/auth/login', label: t('signInTitle') },
        ]} />
        <FieldDescription className="text-center text-[0.65rem]">
          {t('passwordHint')}
        </FieldDescription>
      </AuthForm.Footer>
    </AuthForm>
  );
}

