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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isClient && !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-6 max-w-md mx-auto bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to play the daily quiz.</p>
          <Button
            onClick={() => window.location.href = '/sign-in'}
            className="w-full sm:w-auto px-8 py-2"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 py-8">
      <div className="w-full max-w-md mx-auto text-center mb-6">
        <h1 className="text-3xl font-bold mb-3">Daily Challenge</h1>
        <p className="text-muted-foreground">Test your NFL knowledge with today's three questions</p>
      </div>
      
      <DailyQuiz />
    </div>
  );
} 