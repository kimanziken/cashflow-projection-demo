// app/layout.tsx (or root layout file)
'use client';

import { cn } from '@/lib/utils';
import './globals.css';

import { Outfit } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/firebaseConfig';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '../components/mine/loading';

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Handling loading state
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>flowmaster</title>
        <meta name="flowmaster" content="Manage your cash flow" />
      </head>
      <body
        className={cn(
          'font-sans antialiased',
          outfit.className,
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        {loading ? (
          <Loading />
        ) : (
          <div className={cn('bg-[#F1F3F4] dark:bg-muted/30')}>{children}</div> // Render children when not loading
        )}
      </body>
    </html>
  );
}
