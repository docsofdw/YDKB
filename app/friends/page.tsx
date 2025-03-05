'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import FriendsList from '@/app/components/features/friends/FriendsList';
import AddFriend from '@/app/components/features/friends/AddFriend';
import FriendsLeaderboard from '@/app/components/features/friends/FriendsLeaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from 'framer-motion';

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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-100">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div 
          className="card glass text-center p-8 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-4 gradient-text">Sign In Required</h1>
          <p className="text-gray-300 mb-6">Please sign in to view and manage your friends.</p>
          <Link
            href="/login"
            className="btn-primary w-full"
          >
            Sign In
          </Link>
        </motion.div>
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
                Social Features
              </span>
              <h1 className="text-4xl font-bold mb-4">
                Your <span className="gradient-text">Friends</span>
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Connect with other players, compete on the leaderboard, and challenge your friends!
              </p>
            </div>
            
            <Tabs value={activeTab} defaultValue="friends" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-surface p-1 rounded-lg">
                <TabsTrigger 
                  value="friends"
                  className="data-[state=active]:bg-primary-green data-[state=active]:text-background"
                >
                  Friends List
                </TabsTrigger>
                <TabsTrigger 
                  value="leaderboard"
                  className="data-[state=active]:bg-primary-green data-[state=active]:text-background"
                >
                  Leaderboard
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="friends" className="mt-8">
                <div className="card glass p-6 mb-6">
                  <AddFriend />
                </div>
                <div className="card glass p-6">
                  <FriendsList />
                </div>
              </TabsContent>
              
              <TabsContent value="leaderboard" className="mt-8">
                <div className="card glass p-6">
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