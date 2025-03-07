/**
 * YDKB - You Don't Know Ball
 * 
 * NON-AUTHENTICATED HOMEPAGE
 * 
 * This file contains the landing page shown to users who are not logged in.
 * For the authenticated user experience, see: app/components/home/AuthenticatedHome.tsx
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import AuthenticatedHome from './components/home/AuthenticatedHome';
import { motion } from 'framer-motion';
import { LockIcon, CalendarIcon } from 'lucide-react';

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-100">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show the authenticated home page
  if (isSignedIn) {
    return <AuthenticatedHome />;
  }

  return (
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
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/play" 
            className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-64 text-lg px-8 py-4 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20"
          >
            <LockIcon size={18} className="opacity-80" />
            <span>Play Now</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/10 to-secondary-green/10 blur"></div>
          </Link>
          
          <Link 
            href="/archive" 
            className="glass-button-secondary group relative flex items-center justify-center gap-2 w-full sm:w-64 text-lg px-8 py-4 rounded-full backdrop-blur-md bg-surface/20 border border-gray-700/30 text-gray-300 font-medium transition-all duration-300 hover:bg-surface/40 hover:text-primary-green hover:border-primary-green/30"
          >
            <CalendarIcon size={18} className="opacity-80" />
            <span>View Archive</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/5 to-secondary-green/5 blur"></div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 