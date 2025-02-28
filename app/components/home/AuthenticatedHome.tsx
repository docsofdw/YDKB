/**
 * YDKB - You Don't Know Ball
 * 
 * AUTHENTICATED HOMEPAGE COMPONENT
 * 
 * This file contains the homepage shown to users who are logged in.
 * For the non-authenticated user experience, see: app/page.jsx
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AuthenticatedHome() {
  // This component handles the authenticated user experience
  // It displays personalized content, daily challenges, user stats, and community activity
  
  const [dailyChallenge, setDailyChallenge] = useState({
    title: "Today's Challenge",
    description: "Identify these 10 players from their college stats",
    difficulty: "Medium",
    completionRate: 68,
  });
  
  const [userStats, setUserStats] = useState({
    rank: 423,
    totalPlayed: 47,
    averageScore: 82.5,
    streak: 12,
    recentScores: [85, 90, 75, 95, 80]
  });
  
  const [recentActivity, setRecentActivity] = useState([
    { user: "MarchMadness23", score: 95, time: "2h ago" },
    { user: "HoopsDreams", score: 92, time: "3h ago" },
    { user: "BballFanatic", score: 90, time: "4h ago" },
    { user: "CourtVision", score: 88, time: "5h ago" }
  ]);

  return (
    <div className="min-h-screen bg-deep-slate text-chalk-white">
      {/* Welcome Section */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="bg-midnight-navy rounded-xl p-6 md:p-8 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-heading-1 font-bold mb-2 font-montserrat">Welcome Back!</h1>
            <p className="text-silver-gray mb-6">Ready to test your NFL college knowledge today?</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/play" className="btn-primary text-center">
                Play Today's Challenge
              </Link>
              <Link href="/profile" className="btn-secondary text-center">
                View Your Stats
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-6 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Challenge Card */}
          <motion.div 
            className="card border-l-4 border-l-turf-green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-heading-2 font-semibold mb-4 flex items-center font-montserrat">
              <span className="text-2xl mr-2">🏈</span> 
              {dailyChallenge.title}
            </h2>
            <p className="text-silver-gray mb-3">{dailyChallenge.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="bg-turf-green/20 text-turf-green text-xs font-medium px-2.5 py-0.5 rounded">
                {dailyChallenge.difficulty}
              </span>
              <span className="text-sm text-silver-gray">
                {dailyChallenge.completionRate}% completion rate
              </span>
            </div>
            <Link href="/play" className="btn-primary w-full text-center block">
              Start Challenge
            </Link>
          </motion.div>

          {/* User Stats Card */}
          <motion.div 
            className="card border-l-4 border-l-highlight-blue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-heading-2 font-semibold mb-4 flex items-center font-montserrat">
              <span className="text-2xl mr-2">📊</span> 
              Your Stats
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-deep-slate p-3 rounded-lg">
                <p className="text-silver-gray text-xs">Current Rank</p>
                <p className="text-xl font-bold text-chalk-white">{userStats.rank}</p>
              </div>
              <div className="bg-deep-slate p-3 rounded-lg">
                <p className="text-silver-gray text-xs">Avg Score</p>
                <p className="text-xl font-bold text-chalk-white">{userStats.averageScore}</p>
              </div>
              <div className="bg-deep-slate p-3 rounded-lg">
                <p className="text-silver-gray text-xs">Games Played</p>
                <p className="text-xl font-bold text-chalk-white">{userStats.totalPlayed}</p>
              </div>
              <div className="bg-deep-slate p-3 rounded-lg">
                <p className="text-silver-gray text-xs">Current Streak</p>
                <p className="text-xl font-bold text-chalk-white">{userStats.streak} days</p>
              </div>
            </div>
            <Link href="/profile" className="text-highlight-blue text-sm font-medium hover:text-highlight-blue/80 transition-colors flex items-center justify-center">
              View Full Stats <span className="ml-1">→</span>
            </Link>
          </motion.div>

          {/* Community Activity Card */}
          <motion.div 
            className="card border-l-4 border-l-victory-green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-heading-2 font-semibold mb-4 flex items-center font-montserrat">
              <span className="text-2xl mr-2">🏆</span> 
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-deep-slate rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-chalk-white">{activity.user}</p>
                    <p className="text-xs text-silver-gray">{activity.time}</p>
                  </div>
                  <div className="bg-victory-green/20 text-victory-green text-sm font-medium px-2.5 py-0.5 rounded">
                    {activity.score}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/leaderboard" className="text-highlight-blue text-sm font-medium hover:text-highlight-blue/80 transition-colors flex items-center justify-center mt-4">
              View Leaderboard <span className="ml-1">→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 