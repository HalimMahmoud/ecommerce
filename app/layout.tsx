import type { Metadata } from 'next';
import './globals.css';
import { Outfit } from 'next/font/google';
import { StoreProvider } from '@/lib/store-context';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import DirectionSetter from '@/components/direction';
import SiteShell from '@/components/site-shell';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import DarkModeProvider from '@/components/dark-mode-provider';

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Gulf Store - Premium E-commerce',
  description: 'Discover quality products with Gulf Store',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans', "font-sans", outfit.variable)}>
      <body className={`font-sans antialiased`}>
        <Suspense>
          <NuqsAdapter>
            <StoreProvider>
              <DarkModeProvider>
                <DirectionSetter />
                <SiteShell>{children}</SiteShell>
              </DarkModeProvider>
            </StoreProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
