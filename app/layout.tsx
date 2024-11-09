// app/layout.tsx (or root layout file)
"use client";

import { cn } from "@/lib/utils";
import "./globals.css";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Outfit } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/mine/loading";
import { auth } from "./firebase/firebaseConfig";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Handling loading state
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
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
          "font-sans antialiased",
          outfit.className,
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            <Toaster richColors />
            <QueryClientProvider client={queryClient}>
              <div className={cn("bg-[#F1F3F4] dark:bg-muted/30")}>
                {children}
              </div>
            </QueryClientProvider>
          </>
        )}
      </body>
    </html>
  );
}
