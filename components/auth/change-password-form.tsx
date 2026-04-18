'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';

import { AuthForm } from '@/components/auth/ui/auth-form';
import PasswordStrengthMeter from '@/components/auth/password-strength-meter';
import { FieldGroup, FieldDescription, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { changePasswordAction } from '@/lib/auth/actions';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/auth/schemas';
import { initialAuthState } from '@/lib/auth/action-state';

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialAuthState);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (state.error) { setRootError(state.error); setSuccessMessage(null); return; }
    setRootError(null);
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs[0])
          form.setError(key as keyof ChangePasswordInput, { message: msgs[0] });
      });
      return;
    }
    if (state.success || state.message) {
      setSuccessMessage(state.success ?? state.message ?? null);
      form.reset();
    }
  }, [state, form]);

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
        title="Change password"
        description="Update the password on your signed-in account. Enter your current password, then choose a new one and confirm it."
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-4">
            {successMessage && <AuthForm.SuccessBanner title="Password updated" description={successMessage} />}
            {rootError && <AuthForm.ErrorBanner message={rootError} />}

            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="change-current-password">Current password</FieldLabel>
              <Input id="change-current-password" type="password" autoComplete="current-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.currentPassword}
                {...form.register('currentPassword')} />
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="change-password">New password</FieldLabel>
              <Input id="change-password" type="password" autoComplete="new-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.password}
                {...form.register('password')} />
              <FieldError errors={[errors.password]} />
              <PasswordStrengthMeter password={password} />
            </Field>

            <Field data-invalid={!!errors.passwordConfirmation}>
              <FieldLabel htmlFor="change-password-confirmation">Confirm new password</FieldLabel>
              <Input id="change-password-confirmation" type="password" autoComplete="new-password"
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
          { href: '/', label: 'Home' },
          { href: '/auth/login', label: 'Sign in' },
        ]} />
        <FieldDescription className="text-center text-[0.65rem]">
          Your new password should be at least 8 characters and match the confirmation field.
        </FieldDescription>
      </AuthForm.Footer>
    </AuthForm>
  );
}
