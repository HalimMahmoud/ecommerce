'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import PasswordStrengthMeter from '@/components/features/auth/password-strength-meter';

interface PasswordFormFieldsProps {
  prefix?: string;
  showStrength?: boolean;
}

export function PasswordFormFields({ prefix = '', showStrength = true }: PasswordFormFieldsProps) {
  const t = useTranslations('auth');
  const { register, watch, formState: { errors } } = useFormContext();
  
  const password = watch('password');
  const passwordError = errors.password;
  const confirmationError = errors.passwordConfirmation;

  return (
    <>
      <Field data-invalid={!!passwordError} className="space-y-2">
        <FieldLabel htmlFor={`${prefix}password`}>{t('password')}</FieldLabel>
        <Input 
          id={`${prefix}password`} 
          type="password" 
          autoComplete="new-password"
          className="h-10 min-h-11 text-sm md:text-sm" 
          aria-invalid={!!passwordError}
          {...register('password')} 
        />
        <FieldError errors={[passwordError]} />
        {showStrength && <PasswordStrengthMeter password={password} />}
      </Field>

      <Field data-invalid={!!confirmationError} className="space-y-2">
        <FieldLabel htmlFor={`${prefix}confirm`}>{t('confirmPassword')}</FieldLabel>
        <Input 
          id={`${prefix}confirm`} 
          type="password" 
          autoComplete="new-password"
          className="h-10 min-h-11 text-sm md:text-sm" 
          aria-invalid={!!confirmationError}
          {...register('passwordConfirmation')} 
        />
        <FieldError errors={[confirmationError]} />
      </Field>
    </>
  );
}
