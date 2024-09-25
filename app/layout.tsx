import { cn } from '@/lib/utils';
import './globals.css';

import { Outfit } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          outfit.className,
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <div className={cn('bg-[#F1F3F4] dark:bg-muted/30')}>{children}</div>
      </body>
    </html>
  );
}
