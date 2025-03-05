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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/play" className="btn-primary w-full sm:w-auto text-lg px-8 py-3">
            Play Now
          </Link>
          <Link href="/archive" className="btn-secondary w-full sm:w-auto text-lg px-8 py-3">
            View Archive
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 