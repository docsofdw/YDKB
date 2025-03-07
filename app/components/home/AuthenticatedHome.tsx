/**
 * YDKB - You Don't Know Ball
 * 
 * AUTHENTICATED HOME COMPONENT
 * 
 * The home page shown to authenticated users, featuring their daily challenge
 * and archive access.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { PlayIcon, CalendarIcon } from 'lucide-react';

export default function AuthenticatedHome() {
  const { user } = useUser();
  const firstName = user?.firstName || 'Player';
  
  return (
    <div className="bg-background text-gray-100 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Welcome Back, <span className="gradient-text">{firstName}</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-md mx-auto">
          Ready to test your knowledge of NFL players' college careers?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/play" 
            className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-64 text-lg px-8 py-4 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20"
          >
            <PlayIcon size={18} className="opacity-80" />
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