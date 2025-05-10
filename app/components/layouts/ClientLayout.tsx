'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import NavbarClient from "@/app/components/ui/Navbar";
import { inter, montserrat } from "@/app/config/fonts";
import { Suspense } from "react";

const NavbarFallback = () => (
  <nav className="bg-deep-slate border-b border-midnight-navy sticky top-0 z-50 shadow-md h-20"></nav>
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <meta name="theme-color" content="#0CCE6B" />
        </head>
        <body
          className="min-h-screen bg-deep-slate font-inter antialiased"
          suppressHydrationWarning
        >
          <div className="relative flex min-h-screen flex-col">
            <Suspense fallback={<NavbarFallback />}>
              <NavbarClient />
            </Suspense>
            <main className="flex-1">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
} 