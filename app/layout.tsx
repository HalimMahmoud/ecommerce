import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Outfit } from 'next/font/google';
import { StoreProvider } from '@/lib/store-context';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import DirectionSetter from '@/components/layout/direction';
import SiteShell from '@/components/layout/site-shell';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import DarkModeProvider from '@/components/layout/dark-mode-provider';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Halim Store - Premium E-commerce',
    template: '%s | Halim Store',
  },
  description: 'Curated premium products for a unique shopping experience. Discover quality and beauty at Halim Store.',
  keywords: ['ecommerce', 'premium products', 'shopping', 'Halim Store'],
  authors: [{ name: 'Halim Store Team' }],
  creator: 'Halim Store',
  publisher: 'Halim Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Halim Store - Premium E-commerce',
    description: 'Curated premium products for a unique shopping experience.',
    type: 'website',
    siteName: 'Halim Store',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={cn('font-sans', outfit.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('halim_darkMode');
                  if (saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Suspense>
            <NuqsAdapter>
              <StoreProvider>
                <DirectionSetter />
                <SiteShell>{children}</SiteShell>
              </StoreProvider>
            </NuqsAdapter>
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

