'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { CalendarDays, Clock, Trophy, Zap } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function PlayPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  
  // This ensures hydration issues don't occur
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Only render the sign-in required message on the client side
  if (isClient && !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to play quizzes.</p>
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
    <div className="play-page">
      {isClient && (
        <>
          <h1 className="text-3xl font-bold mb-2">Play</h1>
          <p className="text-muted-foreground mb-6">Choose a quiz type to test your knowledge</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Daily Challenge Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-turf-green" />
                  Daily Challenge
                </CardTitle>
                <CardDescription>Test your knowledge with today's featured quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">5 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">10 questions</span>
                  </div>
                </div>
                <p className="text-sm mb-4">
                  Today's topic: <span className="font-medium">NFL Draft History</span>
                </p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/play/daily" 
                  className="w-full"
                >
                  <Button className="w-full">Play Daily Challenge</Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* On-Demand Quiz Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-turf-green" />
                  On-Demand Quiz
                </CardTitle>
                <CardDescription>Choose from a variety of topics to test your knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">5-15 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Various difficulties</span>
                  </div>
                </div>
                <p className="text-sm mb-4">
                  Topics include: NFL History, Current Players, Super Bowl Trivia, and more
                </p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/play/quiz" 
                  className="w-full"
                >
                  <Button className="w-full">Browse Quiz Topics</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 