import type { Metadata } from 'next';
import { Recursive } from 'next/font/google';
import './globals.css';

import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/components/Providers';
import { constructMetadata } from '@/lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/next';
import NextTopLoader from 'nextjs-toploader';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Navbar } from '@/components/Navbar';

const recursive = Recursive({ subsets: ['latin'] });

export const metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className={recursive.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NextTopLoader />
          <Navbar />

          <main className="flex grainy-light flex-col min-h-[calc(100vh-3.5rem-1px)]">
            <div className="flex-1 flex flex-col h-full">
              <Providers>{children}</Providers>
            </div>
            <Footer />
          </main>

          <Toaster />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
