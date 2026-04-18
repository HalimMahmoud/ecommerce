'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// AuthForm — compound component for all auth forms
// Usage: <AuthForm onSubmit={fn}>
//          <AuthForm.Header icon={...} title="..." description="..." />
//          <AuthForm.Content>...</AuthForm.Content>
//          <AuthForm.Footer submitLabel="..." isSubmitting={...}>
//            <AuthForm.Separator />
//            <AuthForm.Links links={[...]} />
//            <AuthForm.Note>...</AuthForm.Note>
//          </AuthForm.Footer>
//        </AuthForm>
// ---------------------------------------------------------------------------

function AuthFormRoot({
  children,
  onSubmit,
  action,
}: {
  children: ReactNode;
  onSubmit?: React.ComponentProps<'form'>['onSubmit'];
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const card = (
    <Card className="w-full max-w-md border-border/80 bg-card shadow-lg ring-1 ring-border/50">
      {children}
    </Card>
  );
  if (action) return <form action={action} noValidate>{card}</form>;
  if (onSubmit) return <form onSubmit={onSubmit} noValidate>{card}</form>;
  return card;
}

function AuthFormHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}) {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}

function AuthFormContent({ children }: { children: ReactNode }) {
  return <CardContent className="space-y-4">{children}</CardContent>;
}

function AuthFormFooter({
  submitLabel,
  isSubmitting = false,
  submitDisabled,
  children,
}: {
  submitLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <CardFooter className="flex flex-col gap-4 border-t bg-muted/5 pt-6">
      {submitLabel && (
        <Button
          type="submit"
          className="w-full"
          disabled={submitDisabled ?? isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? <Spinner className="size-4 animate-spin mr-2" /> : null}
          {submitLabel}
        </Button>
      )}
      {children}
    </CardFooter>
  );
}

function AuthFormErrorBanner({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="py-3" aria-live="assertive">
      <AlertCircle className="size-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function AuthFormSuccessBanner({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Alert className="border-primary/20 bg-primary/5 py-3 text-primary" aria-live="polite">
      <CheckCircle2 className="size-4" />
      <AlertDescription className="font-medium">
        {title}
        {description ? (
          <span className="block text-xs font-normal opacity-80">{description}</span>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

function AuthFormLinks({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {links.map((link, index) => (
        <span key={link.href} className="flex items-center gap-4">
          {index > 0 && <span className="text-border">·</span>}
          <Link href={link.href} className="hover:text-primary transition-colors">
            {link.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

function AuthFormNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-[0.7rem] text-muted-foreground leading-relaxed">{children}</p>
  );
}

function AuthFormSeparator() {
  return <Separator className="my-2" />;
}

export const AuthForm = Object.assign(AuthFormRoot, {
  Header: AuthFormHeader,
  Content: AuthFormContent,
  Footer: AuthFormFooter,
  ErrorBanner: AuthFormErrorBanner,
  SuccessBanner: AuthFormSuccessBanner,
  Links: AuthFormLinks,
  Note: AuthFormNote,
  Separator: AuthFormSeparator,
});

// ---------------------------------------------------------------------------
// AuthShell — page-level wrapper for the auth section (logo + centering)
// ---------------------------------------------------------------------------

export function AuthShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative min-h-[calc(100vh-8rem)] bg-muted/30 py-12 md:py-20', className)}>
      <div className="container mx-auto max-w-5xl px-4">
        <header className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link href="/" className="group flex items-center gap-2" aria-label="GULF STORE - Home">
            <ShoppingCart className="size-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">GULF STORE</span>
          </Link>
        </header>
        <main className="flex items-center justify-center">{children}</main>
      </div>
    </div>
  );
}
