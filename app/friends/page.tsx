'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import FriendsList from '@/app/components/features/friends/FriendsList';
import AddFriend from '@/app/components/features/friends/AddFriend';
import FriendsLeaderboard from '@/app/components/features/friends/FriendsLeaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function FriendsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends');

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to view and manage your friends.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <SignedIn>
        <h1 className="text-3xl font-bold mb-6">Friends</h1>
        
        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="friends">Friends List</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <FriendsLeaderboard />
          </TabsContent>
        </Tabs>
      </SignedIn>
      
      <SignedOut>
        {redirect("/")}
      </SignedOut>
    </div>
  );
} 