/**
 * YDKB - You Don't Know Ball
 * 
 * HOME COMPONENT
 * 
 * A simplified, Wordle-inspired home page that works for both
 * authenticated and non-authenticated users.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

export default function HomePage() {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="min-h-screen bg-deep-slate text-chalk-white flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-montserrat mb-4">YDKB</h1>
          <p className="text-xl text-silver-gray mb-2">
            Daily NFL Knowledge Test
          </p>
          <div className="space-y-1 text-md text-silver-gray/80">
            <p>3 Questions • 3 Difficulty Levels</p>
            <p>1 Chance Per Question</p>
            <p>Think You Know Ball?</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/play" 
            className="btn-primary w-full py-3 text-center block bg-turf-green hover:bg-turf-green/90 transition-colors"
          >
            Play Today's Quiz
          </Link>
          
          {!isSignedIn ? (
            <>
              <Link 
                href="/sign-in"
                className="btn-secondary w-full py-3 text-center block border border-silver-gray/30 hover:bg-midnight-navy transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/subscribe" 
                className="btn-secondary w-full py-3 text-center block border border-silver-gray/30 hover:bg-midnight-navy transition-colors"
              >
                Subscribe for up to 75% off
              </Link>
            </>
          ) : (
            <Link 
              href="/stats" 
              className="btn-secondary w-full py-3 text-center block border border-silver-gray/30 hover:bg-midnight-navy transition-colors"
            >
              View Stats
            </Link>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-12 text-sm text-silver-gray">
          <p>March 5, 2025</p>
          <p>No. 1355</p>
          <p>Edited by Tracy Bennett</p>
        </div>
      </motion.div>
    </div>
  );
} 