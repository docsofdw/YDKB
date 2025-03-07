// app/leaderboard/page.tsx
'use client';

import { GameLeaderboard, Player } from "@/app/components/common/ui/game-leaderboard";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Users } from "lucide-react";

// Sample player data for "You Don't Know Ball" game
const samplePlayers: Player[] = [
  {
    id: "1",
    name: "CollegeHoopsExpert",
    score: 2450,
    trend: "up",
    rank: 1,
    avatar: "https://i.pravatar.cc/150?img=1",
    gamesPlayed: 42,
    winRate: 85,
  },
  {
    id: "2",
    name: "MarchMadnessFan",
    score: 2180,
    trend: "up",
    rank: 2,
    avatar: "https://i.pravatar.cc/150?img=2",
    gamesPlayed: 38,
    winRate: 79,
  },
  {
    id: "3",
    name: "HoopsDreams",
    score: 1920,
    trend: "neutral",
    rank: 3,
    avatar: "https://i.pravatar.cc/150?img=3",
    gamesPlayed: 35,
    winRate: 74,
  },
  {
    id: "4",
    name: "BracketBuster",
    score: 1750,
    trend: "down",
    rank: 4,
    avatar: "https://i.pravatar.cc/150?img=4",
    gamesPlayed: 40,
    winRate: 68,
  },
  {
    id: "5",
    name: "CollegeHoopsGuru",
    score: 1680,
    trend: "up",
    rank: 5,
    avatar: "https://i.pravatar.cc/150?img=5",
    gamesPlayed: 32,
    winRate: 72,
  },
  {
    id: "6",
    name: "NCAAWizard",
    score: 1550,
    trend: "up",
    rank: 6,
    avatar: "https://i.pravatar.cc/150?img=6",
    gamesPlayed: 30,
    winRate: 65,
  },
  {
    id: "7",
    name: "CollegeBaller",
    score: 1420,
    trend: "down",
    rank: 7,
    avatar: "https://i.pravatar.cc/150?img=7",
    gamesPlayed: 28,
    winRate: 60,
  },
  {
    id: "8",
    name: "HoopsKnowledge",
    score: 1290,
    trend: "neutral",
    rank: 8,
    avatar: "https://i.pravatar.cc/150?img=8",
    gamesPlayed: 25,
    winRate: 58,
  },
  {
    id: "9",
    name: "BballScholar",
    score: 1160,
    trend: "up",
    rank: 9,
    avatar: "https://i.pravatar.cc/150?img=9",
    gamesPlayed: 22,
    winRate: 55,
  },
  {
    id: "10",
    name: "CollegeHoopsFan",
    score: 1030,
    trend: "down",
    rank: 10,
    avatar: "https://i.pravatar.cc/150?img=10",
    gamesPlayed: 20,
    winRate: 52,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function LeaderboardPage() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-100">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-100">
      <div className="max-w-[1200px] mx-auto py-16 px-4">
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-16">
              <span className="bg-primary-green text-background px-3 py-1 font-semibold rounded-lg text-xs uppercase inline-block mb-3 shadow-green-glow">
                Global Rankings
              </span>
              <h1 className="text-4xl font-bold mb-4">
                Top <span className="gradient-text">Players</span>
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                See how you stack up against the best players in the community
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto"
            >
              <div className="glass rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-surface/30 border border-gray-700/30">
                    <Trophy className="w-8 h-8 text-primary-green mx-auto mb-2" />
                    <h3 className="text-xl font-bold mb-1">Global Rank</h3>
                    <p className="text-3xl font-bold text-primary-green">#1</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-surface/30 border border-gray-700/30">
                    <TrendingUp className="w-8 h-8 text-primary-green mx-auto mb-2" />
                    <h3 className="text-xl font-bold mb-1">Win Rate</h3>
                    <p className="text-3xl font-bold text-primary-green">85%</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-surface/30 border border-gray-700/30">
                    <Users className="w-8 h-8 text-primary-green mx-auto mb-2" />
                    <h3 className="text-xl font-bold mb-1">Games Played</h3>
                    <p className="text-3xl font-bold text-primary-green">42</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <GameLeaderboard players={samplePlayers} />
              </div>
            </motion.div>
          </motion.div>
        </SignedIn>
        
        <SignedOut>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="text-center p-8 max-w-md mx-auto glass rounded-xl">
              <h1 className="text-2xl font-bold mb-4 text-gray-100">Sign In Required</h1>
              <p className="mb-6 text-gray-300">Please sign in to view the leaderboard and track your progress.</p>
              <Link
                href="/login"
                className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-4 py-2.5 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20 mx-auto"
              >
                <span>Sign In</span>
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/10 to-secondary-green/10 blur"></div>
              </Link>
            </div>
          </motion.div>
        </SignedOut>
      </div>
    </div>
  );
}
