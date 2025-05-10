// app/layout.tsx
import type { Metadata } from "next"
import "@/app/styles/globals.css"
import "@/app/styles/layout.css"
import ClientLayout from "@/app/components/layouts/ClientLayout"
import { inter, montserrat } from "@/app/config/fonts"

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
    <ClientLayout>{children}</ClientLayout>
  )
}