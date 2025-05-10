'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

interface QuestionResultProps {
  question: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

interface SummaryCardProps {
  title: string;
  score: {
    correct: number;
    total: number;
  };
  timeTaken: number;
  questionResults: QuestionResultProps[];
  returnUrl: string;
}

export default function SummaryCard({
  title,
  score,
  timeTaken,
  questionResults,
  returnUrl
}: SummaryCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const percentage = Math.round((score.correct / score.total) * 100);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold">
            {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground">
            {percentage}% Correct • Completed in {formatTime(timeTaken)}
          </p>
        </div>
        
        <div className="space-y-4">
          {questionResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <div className="flex items-start gap-2">
                {result.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                
                <div>
                  <p className="font-medium">
                    {index + 1}. {result.question}
                  </p>
                  
                  <div className="mt-2">
                    <p className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                      Your answer: {result.userAnswer}
                    </p>
                    
                    {!result.isCorrect && (
                      <p className="text-green-600">
                        Correct answer: {result.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={returnUrl} className="w-full">
          <Button className="w-full">Return to Home</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 