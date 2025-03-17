'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";
import { Clock, Zap, Trophy, Star, BarChart, History, Users, Award } from "lucide-react";

// Quiz categories data
const QUIZ_CATEGORIES = [
  {
    id: "nfl-history",
    title: "NFL History",
    description: "Test your knowledge of NFL history from the early days to modern times.",
    icon: <History className="h-5 w-5" />,
    difficulty: "Medium",
    questionCount: 15,
    timeLimit: "10 min",
    popularityRank: 2
  },
  {
    id: "current-players",
    title: "Current Players",
    description: "How well do you know today's NFL stars?",
    icon: <Users className="h-5 w-5" />,
    difficulty: "Easy",
    questionCount: 10,
    timeLimit: "5 min",
    popularityRank: 1
  },
  {
    id: "super-bowl",
    title: "Super Bowl Trivia",
    description: "From the first Super Bowl to the most recent, test your championship knowledge.",
    icon: <Trophy className="h-5 w-5" />,
    difficulty: "Hard",
    questionCount: 20,
    timeLimit: "15 min",
    popularityRank: 3
  },
  {
    id: "team-records",
    title: "Team Records",
    description: "Test your knowledge of NFL team records and statistics.",
    icon: <BarChart className="h-5 w-5" />,
    difficulty: "Hard",
    questionCount: 15,
    timeLimit: "10 min",
    popularityRank: 4
  },
  {
    id: "football-rules",
    title: "Football Rules",
    description: "How well do you know the rules of the game?",
    icon: <Award className="h-5 w-5" />,
    difficulty: "Medium",
    questionCount: 12,
    timeLimit: "8 min",
    popularityRank: 5
  },
  {
    id: "draft-picks",
    title: "Draft Picks",
    description: "Test your knowledge of NFL Draft history and notable picks.",
    icon: <Star className="h-5 w-5" />,
    difficulty: "Medium",
    questionCount: 15,
    timeLimit: "10 min",
    popularityRank: 6
  }
];

export default function QuizSelectionPage() {
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
          <p className="mb-6">Please sign in to browse quizzes.</p>
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

  // Sort quizzes by popularity
  const sortedQuizzes = [...QUIZ_CATEGORIES].sort((a, b) => a.popularityRank - b.popularityRank);

  return (
    <div className="quiz-selection-page">
      <h1 className="text-3xl font-bold mb-2">Choose a Quiz</h1>
      <p className="text-muted-foreground mb-6">Select a topic to test your NFL knowledge</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedQuizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {quiz.icon}
                {quiz.title}
              </CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{quiz.timeLimit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{quiz.questionCount} questions</span>
                </div>
              </div>
              <div className="bg-muted p-2 rounded-lg text-center">
                <span className="text-sm font-medium">
                  Difficulty: {quiz.difficulty}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/play/quiz/${quiz.id}`} className="w-full">
                <Button variant="outline" className="w-full">Start Quiz</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 