'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import FriendsList from '../components/features/friends/FriendsList';
import AddFriend from '../components/features/friends/AddFriend';
import FriendsLeaderboard from '@/app/components/features/friends/FriendsLeaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Users, Trophy } from 'lucide-react';

export default function FriendsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div 
          className="w-full max-w-sm p-6 rounded-xl bg-surface/50 backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-medium mb-2">Sign In Required</h1>
          <p className="text-sm text-gray-400 mb-6">Please sign in to access your friends list.</p>
          <Link
            href="/login"
            className="w-full py-2 px-4 bg-primary-green text-background rounded-lg text-sm font-medium hover:bg-primary-green/90 transition-colors"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-medium mb-2">Friends</h1>
              <p className="text-sm text-gray-400">
                Connect with other players and track your progress
              </p>
            </div>
            
            <Tabs value={activeTab} defaultValue="friends" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-surface/50 backdrop-blur-sm p-1 rounded-lg border border-white/10">
                <TabsTrigger 
                  value="friends"
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-primary-green data-[state=active]:text-background"
                >
                  <Users className="w-4 h-4" />
                  Friends List
                </TabsTrigger>
                <TabsTrigger 
                  value="leaderboard"
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-primary-green data-[state=active]:text-background"
                >
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="friends" className="space-y-4">
                <div className="rounded-xl bg-surface/50 backdrop-blur-sm p-4 border border-white/10">
                  <AddFriend />
                </div>
                <div className="rounded-xl bg-surface/50 backdrop-blur-sm p-4 border border-white/10">
                  <FriendsList />
                </div>
              </TabsContent>
              
              <TabsContent value="leaderboard">
                <div className="rounded-xl bg-surface/50 backdrop-blur-sm p-4 border border-white/10">
                  <FriendsLeaderboard />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </SignedIn>
      </div>
    </div>
  );
} 