'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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
  action,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit?: React.ComponentProps<'form'>['onSubmit'];
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const rootClasses = cn(
    "w-full sm:max-w-[480px] mx-auto border-border/80 bg-card shadow-2xl ring-1 ring-border/50 rounded-xl overflow-hidden transition-all duration-300",
  );

  if (action) {
    return (
      <form action={action} noValidate className={rootClasses}>
        {children}
      </form>
    );
  }

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} noValidate className={rootClasses}>
        {children}
      </form>
    );
  }

  return <div className={rootClasses}>{children}</div>;
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
    <CardHeader className="text-center space-y-4 pt-8 pb-6 px-6 sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-110">
        <Icon className="size-8" />
      </div>
      <div className="space-y-2">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm sm:text-base px-2">{description}</CardDescription>
      </div>
    </CardHeader>
  );
}

function AuthFormContent({ children }: { children: ReactNode }) {
  return <CardContent className="space-y-6 pt-2 pb-8 px-6 sm:px-8">{children}</CardContent>;
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
    <CardFooter className="flex flex-col gap-4 border-t bg-muted/5 pt-6 pb-8 px-6 sm:px-8">
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
  const t = useTranslations('marketing');

  return (
    <div className={cn('relative min-h-screen flex flex-col lg:flex-row bg-background', className)}>
      {/* Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90" />
        <div className="relative z-10 max-w-md text-white space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
              {t('title')} <br />
              <span className="text-secondary-foreground bg-white px-2 py-1 rounded-sm">{t('highlight')}</span>
            </h2>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          
          <ul className="space-y-4 text-lg">
            {['benefit1', 'benefit2', 'benefit3', 'benefit4'].map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-white" />
                <span>{t(`benefits.${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 p-8 scale-150 opacity-10 rotate-12">
          <ShoppingCart className="size-64" />
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-grow flex items-center justify-center py-12 md:py-20 px-6 bg-muted/30 lg:w-1/2">
        <div className="w-full max-w-xl mx-auto">
          <main className="flex items-center justify-center">{children}</main>
        </div>
      </div>
    </div>
  );
}

