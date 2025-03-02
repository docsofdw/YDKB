'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in seconds
  questions: QuizQuestion[];
};

type QuizInterfaceProps = {
  quiz: Quiz;
  quizType: 'daily' | 'onDemand';
};

export default function QuizInterface({ quiz, quizType }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  
  // Timer effect
  useEffect(() => {
    if (quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizCompleted]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
  };
  
  const handleNextQuestion = () => {
    // Save the answer
    if (selectedOptionId) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedOptionId
      }));
    }
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      handleQuizComplete();
    }
  };
  
  const handleQuizComplete = () => {
    // Save the last answer if selected
    if (selectedOptionId && !answers[currentQuestion.id]) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedOptionId
      }));
    }
    
    setQuizCompleted(true);
    setShowResults(true);
  };
  
  const calculateScore = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer === question.correctOptionId) {
        correctCount++;
      }
    });
    
    return {
      correct: correctCount,
      total: totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100)
    };
  };
  
  if (showResults) {
    const score = calculateScore();
    
    return (
      <Card className="quiz-results">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">{score.percentage}%</div>
            <p className="text-xl">
              You got {score.correct} out of {score.total} questions correct
            </p>
            <p className="text-muted-foreground mt-2">
              Time spent: {formatTime(quiz.timeLimit - timeRemaining)}
            </p>
          </div>
          
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id] || '';
              const isCorrect = userAnswer === question.correctOptionId;
              
              return (
                <div key={question.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {index + 1}. {question.text}
                      </p>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option) => {
                          const isUserSelection = userAnswer === option.id;
                          const isCorrectOption = option.id === question.correctOptionId;
                          
                          let optionClass = 'text-gray-500';
                          if (isUserSelection && isCorrectOption) optionClass = 'text-green-600 font-medium';
                          else if (isUserSelection) optionClass = 'text-red-600 font-medium';
                          else if (isCorrectOption) optionClass = 'text-green-600 font-medium';
                          
                          return (
                            <p key={option.id} className={optionClass}>
                              {option.text} 
                              {isCorrectOption && ' ✓'}
                              {isUserSelection && !isCorrectOption && ' ✗'}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/play" className="w-full">
            <Button className="w-full">Return to Play</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="quiz-interface">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <p className="text-xl font-medium mb-4">{currentQuestion.text}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedOptionId === option.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectOption(option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleNextQuestion} 
          className="w-full"
          disabled={!selectedOptionId}
        >
          {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
} 