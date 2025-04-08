// app/layout.tsx
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "@/app/styles/globals.css"
import "@/app/styles/layout.css"
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "@/app/components/ui/Navbar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = {
  title: "YDKB | You Don't Know Ball",
  description: "Test your knowledge of NFL players' college careers",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ydkb.vercel.app'),
  keywords: ["NFL", "football", "trivia", "sports", "guessing game", "college football"],
  openGraph: {
    title: "You Don't Know Ball | NFL College Trivia",
    description: "Test your knowledge of NFL players' college careers in this daily trivia challenge",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'You Don\'t Know Ball | NFL College Trivia',
    description: 'Test your knowledge of NFL players\' college careers',
  },
  verification: {
    google: 'google-site-verification',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
        <head>
          {/* Removed custom scripts related to jQuery/bootstrap/AJS mocks */}
        </head>
        <body
          className="min-h-screen bg-deep-slate font-inter antialiased"
          suppressHydrationWarning
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          {/* Removed Bootstrap fix script */}
        </body>
      </html>
    </ClerkProvider>
  )
}