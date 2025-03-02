'use client';

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import QuizInterface from "@/app/components/quiz/QuizInterface";

// This would be fetched from an API in a real implementation
const MOCK_DAILY_QUIZ = {
  id: "daily-20230601",
  title: "NFL Draft History",
  description: "Test your knowledge of NFL Draft history with today's challenge!",
  timeLimit: 300, // 5 minutes in seconds
  questions: [
    {
      id: "q1",
      text: "Which quarterback was selected first overall in the 2021 NFL Draft?",
      options: [
        { id: "a", text: "Justin Fields" },
        { id: "b", text: "Trevor Lawrence" },
        { id: "c", text: "Zach Wilson" },
        { id: "d", text: "Mac Jones" }
      ],
      correctOptionId: "b"
    },
    {
      id: "q2",
      text: "Which team had the first overall pick in the 2022 NFL Draft?",
      options: [
        { id: "a", text: "Jacksonville Jaguars" },
        { id: "b", text: "Detroit Lions" },
        { id: "c", text: "Houston Texans" },
        { id: "d", text: "New York Jets" }
      ],
      correctOptionId: "a"
    },
    {
      id: "q3",
      text: "Who was the first non-quarterback selected in the 2023 NFL Draft?",
      options: [
        { id: "a", text: "Will Anderson Jr." },
        { id: "b", text: "Tyree Wilson" },
        { id: "c", text: "Jalen Carter" },
        { id: "d", text: "Devon Witherspoon" }
      ],
      correctOptionId: "a"
    }
    // More questions would be added in a real implementation
  ]
};

export default function DailyChallengePage() {
  return (
    <div className="daily-challenge-page">
      <SignedIn>
        <h1 className="text-3xl font-bold mb-2">Daily Challenge</h1>
        <p className="text-muted-foreground mb-6">Complete today's challenge to earn points and extend your streak!</p>
        
        <QuizInterface 
          quiz={MOCK_DAILY_QUIZ}
          quizType="daily"
        />
      </SignedIn>
      
      <SignedOut>
        {redirect("/")}
      </SignedOut>
    </div>
  );
} 