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
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import AuthenticatedHome from './components/home/AuthenticatedHome';

export default function HomePage() {
  // This component handles both authenticated and non-authenticated states
  // and renders the appropriate UI based on the user's authentication status
  const { isLoaded, isSignedIn } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [stats, setStats] = useState({
    totalPlayers: 1842,
    totalGames: 15783,
    averageScore: 78.4
  });

  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deep-slate">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-turf-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-chalk-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show the authenticated home page
  if (isSignedIn) {
    return <AuthenticatedHome />;
  }

  // ========================================================================
  // NON-AUTHENTICATED USER LANDING PAGE STARTS HERE
  // ========================================================================
  return (
    <div className="bg-deep-slate text-chalk-white min-h-screen">
      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto text-center py-16 px-4">
        <div>
          <span className="bg-turf-green text-deep-slate px-4 py-2 font-semibold rounded-md text-sm uppercase inline-block mb-6">
            Test Your NFL College Knowledge Daily
          </span>
          
          <h1 className="text-heading-1 font-extrabold mb-6 font-montserrat leading-tight">
            You Don't Know <span className="text-turf-green">Ball</span>
          </h1>
          
          <p className="text-body-large text-silver-gray mb-10 max-w-2xl mx-auto">
            Test your knowledge of NFL players' college careers with our daily challenges and dominate the leaderboard!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="btn-primary w-full sm:w-auto px-8 py-3 uppercase font-semibold">
              Sign Up Free
            </Link>
            <Link href="/login" className="btn-secondary w-full sm:w-auto px-8 py-3 uppercase font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-midnight-navy py-16 px-4 mt-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="bg-turf-green text-deep-slate px-3 py-1 font-semibold rounded-md text-xs uppercase inline-block mb-3">
              Intense & Competitive
            </span>
            <h2 className="text-heading-2 font-bold uppercase font-montserrat">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border-l-4 border-l-turf-green">
              <div className="text-4xl mb-6">🏈</div>
              <h3 className="text-heading-3 font-semibold mb-3 uppercase font-montserrat">
                Daily Challenges
              </h3>
              <p className="text-silver-gray">
                New football players to identify every day with increasing difficulty levels.
              </p>
            </div>
            
            <div className="card border-l-4 border-l-turf-green">
              <div className="text-4xl mb-6">🏆</div>
              <h3 className="text-heading-3 font-semibold mb-3 uppercase font-montserrat">
                Compete & Rank
              </h3>
              <p className="text-silver-gray">
                Compare your scores with other players and dominate the global leaderboard.
              </p>
            </div>
            
            <div className="card border-l-4 border-l-turf-green">
              <div className="text-4xl mb-6">📊</div>
              <h3 className="text-heading-3 font-semibold mb-3 uppercase font-montserrat">
                Track Progress
              </h3>
              <p className="text-silver-gray">
                Monitor your performance over time and see your knowledge improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Difficulty Levels Section */}
      <section className="py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="bg-turf-green text-deep-slate px-3 py-1 font-semibold rounded-md text-xs uppercase inline-block mb-3">
              Challenge Yourself
            </span>
            <h2 className="text-heading-2 font-bold uppercase font-montserrat">
              Difficulty Levels
            </h2>
            <p className="text-silver-gray max-w-2xl mx-auto mt-4">
              Choose your challenge level and test your knowledge against increasingly difficult questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border-t-4 border-t-easy">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-heading-3 font-semibold uppercase font-montserrat">Easy</h3>
                <span className="bg-easy/20 text-easy px-2 py-1 rounded text-xs font-medium">Rookie</span>
              </div>
              <p className="text-silver-gray mb-4">
                Recent NFL stars and well-known college programs. Perfect for casual fans.
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-silver-gray">Success Rate:</span>
                <span className="text-chalk-white">75%</span>
              </div>
            </div>
            
            <div className="card border-t-4 border-t-hard">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-heading-3 font-semibold uppercase font-montserrat">Hard</h3>
                <span className="bg-hard/20 text-hard px-2 py-1 rounded text-xs font-medium">Veteran</span>
              </div>
              <p className="text-silver-gray mb-4">
                Less obvious players and college connections. For the serious football fan.
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-silver-gray">Success Rate:</span>
                <span className="text-chalk-white">45%</span>
              </div>
            </div>
            
            <div className="card border-t-4 border-t-hall-of-fame">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-heading-3 font-semibold uppercase font-montserrat">Hall of Fame</h3>
                <span className="bg-hall-of-fame/20 text-hall-of-fame px-2 py-1 rounded text-xs font-medium">Legend</span>
              </div>
              <p className="text-silver-gray mb-4">
                Obscure players and college history. Only for the most dedicated football historians.
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-silver-gray">Success Rate:</span>
                <span className="text-chalk-white">15%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-midnight-navy py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="bg-turf-green text-deep-slate px-3 py-1 font-semibold rounded-md text-xs uppercase inline-block mb-3">
              Community Stats
            </span>
            <h2 className="text-heading-2 font-bold uppercase font-montserrat">
              Join The Competition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-turf-green text-5xl font-bold mb-2 font-montserrat">{stats.totalPlayers.toLocaleString()}</div>
              <p className="text-silver-gray uppercase text-sm tracking-wider">Active Players</p>
            </div>
            <div className="text-center">
              <div className="text-turf-green text-5xl font-bold mb-2 font-montserrat">{stats.totalGames.toLocaleString()}</div>
              <p className="text-silver-gray uppercase text-sm tracking-wider">Games Played</p>
            </div>
            <div className="text-center">
              <div className="text-turf-green text-5xl font-bold mb-2 font-montserrat">{stats.averageScore}</div>
              <p className="text-silver-gray uppercase text-sm tracking-wider">Average Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-heading-2 font-bold mb-6 font-montserrat">
            Ready to Test Your Knowledge?
          </h2>
          <p className="text-silver-gray mb-8 text-body-large">
            Sign up now to start playing and see how you stack up against other football fans!
          </p>
          <Link href="/signup" className="btn-primary px-8 py-3 uppercase font-semibold inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-midnight-navy py-8 px-4 border-t border-midnight-navy/50">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-extrabold text-turf-green font-montserrat mb-2">YDKB</div>
            <p className="text-silver-gray text-sm">© {new Date().getFullYear()} You Don't Know Ball. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="text-silver-gray hover:text-chalk-white transition-colors duration-150">About</Link>
            <Link href="/privacy" className="text-silver-gray hover:text-chalk-white transition-colors duration-150">Privacy</Link>
            <Link href="/terms" className="text-silver-gray hover:text-chalk-white transition-colors duration-150">Terms</Link>
            <Link href="/contact" className="text-silver-gray hover:text-chalk-white transition-colors duration-150">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 