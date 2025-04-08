/**
 * YDKB - You Don't Know Ball
 * 
 * HOMEPAGE
 * 
 * This file contains the main landing page.
 * It uses Clerk's <SignedIn> and <SignedOut> components to show different content
 * based on the user's authentication status.
 */

'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { LockIcon, CalendarIcon } from 'lucide-react';
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs'; // Keep useAuth for loading state

// Dynamically import the authenticated home component
const AuthenticatedHome = dynamic(
  () => import('./components/home/AuthenticatedHome'),
  {
    ssr: false,
    // Add a simple loading state for the dynamic component
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-100">Loading Home...</p>
        </div>
      </div>
    ),
  }
);

// Loading Component for Clerk
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-gray-100">Checking Session...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isLoaded } = useAuth();

  // Show loading screen while Clerk is initializing
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Content for Signed In Users */}
      <SignedIn>
        <AuthenticatedHome />
      </SignedIn>

      {/* Content for Signed Out Users */}
      <SignedOut>
        <div className="bg-background text-gray-100 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              You Don't Know <span className="gradient-text">Ball</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-md mx-auto">
              Test your knowledge of NFL players' college careers with our daily challenges.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/login" className="btn-primary flex items-center justify-center">
                <LockIcon className="w-5 h-5 mr-2" />
                Sign In
              </Link>
              <Link href="/signup" className="btn-secondary flex items-center justify-center">
                Get Started
              </Link>
            </div>
            
            <div className="text-gray-400 mt-8">
              <div className="flex items-center justify-center mb-2">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>New challenges every day</span>
              </div>
            </div>
          </motion.div>
        </div>
      </SignedOut>
    </>
  );
} 