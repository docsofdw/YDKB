'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import DailyQuiz from "@/app/components/features/quiz/DailyQuiz";

export default function DailyChallengePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

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

  if (isClient && !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to play the daily quiz.</p>
          <Button
            onClick={() => window.location.href = '/sign-in'}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Challenge</h1>
        <p className="text-muted-foreground">Complete today's challenge to earn points and extend your streak!</p>
      </div>
      
      <DailyQuiz />
    </div>
  );
} 