'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';

import { AuthForm } from '@/components/auth/ui/auth-form';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
        title="Sign in"
        description="Welcome back. Use your email or username and password linked to your Strapi account."
      />
      <AuthForm.Content>
        <FormProvider {...form}>
          <FieldGroup className="gap-4">
            {registered && (
              <AuthForm.SuccessBanner
                title="Account ready"
                description="You can sign in with the credentials you just registered."
              />
            )}
            {resetOk && (
              <AuthForm.SuccessBanner title="Password updated" description="Sign in with your new password." />
            )}
            {rootError && <AuthForm.ErrorBanner message={rootError} />}

            <Field data-invalid={!!errors.identifier}>
              <FieldLabel htmlFor="login-identifier">Email or username</FieldLabel>
              <Input id="login-identifier" type="text" autoComplete="username"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.identifier}
                {...form.register('identifier')} />
              <FieldError errors={[errors.identifier]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Link href="/auth/forgot-password"
                  className="text-[0.7rem] font-medium text-primary underline-offset-4 hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input id="login-password" type="password" autoComplete="current-password"
                className="h-10 min-h-11 text-sm md:text-sm" aria-invalid={!!errors.password}
                {...form.register('password')} />
              <FieldError errors={[errors.password]} />
            </Field>

            <div className="flex items-center gap-2">
              <Checkbox id="login-remember" checked={remember}
                onCheckedChange={checked => form.setValue('remember', Boolean(checked))} />
              <Label htmlFor="login-remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </Label>
            </div>

            {state.rateLimited && (
              <p className="text-sm text-muted-foreground">
                Too many attempts? Wait a few minutes before trying again.
              </p>
            )}
          </FieldGroup>
        </FormProvider>
      </AuthForm.Content>
      <AuthForm.Footer submitLabel="Sign in" isSubmitting={isSubmitting}>
        <AuthForm.Separator />
        <AuthForm.Links links={[
          { href: '/auth/register', label: 'Create account' },
          { href: '/auth/forgot-password', label: 'Reset password' },
          { href: '/', label: 'Home' },
        ]} />
        <AuthForm.Note>
          By continuing you agree to our store policies and Strapi-secured authentication.
        </AuthForm.Note>
      </AuthForm.Footer>
    </AuthForm>
  );
}
