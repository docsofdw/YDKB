'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import Link from 'next/link';
import React from 'react';
import dynamic from 'next/dynamic';
import SpriteIcon from '@/app/components/ui/SpriteIcon';

// Import QuizResults as server component
import QuizResults from './QuizResults';

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

// Memoized option row component
const OptionRow = React.memo(({ 
  option, 
  isSelected, 
  onSelect 
}: { 
  option: QuizOption; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
}) => (
  <button
    key={option.id}
    className={`w-full text-left p-4 rounded-lg border transition-colors ${
      isSelected
        ? 'bg-blue-50 border-blue-300'
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}
    onClick={() => onSelect(option.id)}
  >
    {option.text}
  </button>
));

OptionRow.displayName = 'OptionRow';

export default function QuizInterface({ quiz, quizType }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const selectedOptionIdRef = useRef<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  
  // Force update function for when we need to update the UI after ref changes
  const [, forceUpdate] = useState({});
  const triggerUpdate = useCallback(() => forceUpdate({}), []);
  
  // Timer effect with requestAnimationFrame
  useEffect(() => {
    if (quizCompleted) return;
    
    let raf: number;
    const start = performance.now();
    
    const tick = (timestamp: number) => {
      const elapsedSeconds = Math.floor((timestamp - start) / 1000);
      const newTimeRemaining = Math.max(0, quiz.timeLimit - elapsedSeconds);
      
      setTimeRemaining(newTimeRemaining);
      setTimeSpent(quiz.timeLimit - newTimeRemaining);
      
      if (newTimeRemaining <= 0) {
        handleQuizComplete();
        return;
      }
      
      raf = requestAnimationFrame(tick);
    };
    
    raf = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [quizCompleted, quiz.timeLimit]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSelectOption = (optionId: string) => {
    selectedOptionIdRef.current = optionId;
    setSelectedOptionId(optionId); // Keep this for UI updates
  };
  
  const handleNextQuestion = () => {
    // Save the answer
    if (selectedOptionIdRef.current) {
      answersRef.current = {
        ...answersRef.current,
        [currentQuestion.id]: selectedOptionIdRef.current
      };
    }
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      selectedOptionIdRef.current = null;
      setSelectedOptionId(null);
    } else {
      handleQuizComplete();
    }
  };
  
  const handleQuizComplete = () => {
    // Save the last answer if selected
    if (selectedOptionIdRef.current && !answersRef.current[currentQuestion.id]) {
      answersRef.current = {
        ...answersRef.current,
        [currentQuestion.id]: selectedOptionIdRef.current
      };
    }
    
    setQuizCompleted(true);
    setShowResults(true);
  };
  
  const calculateScore = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question) => {
      const userAnswer = answersRef.current[question.id];
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
    return <QuizResults quiz={quiz} answers={answersRef.current} timeSpent={timeSpent} />;
  }
  
  return (
    <Card className="quiz-interface">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex items-center gap-2">
            <SpriteIcon id="clock" size={16} />
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
              <OptionRow 
                key={option.id}
                option={option}
                isSelected={selectedOptionId === option.id}
                onSelect={handleSelectOption}
              />
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
        <Button 
          onClick={() => {
            // Mark this question as incorrect
            const updatedAnswers = { ...answersRef.current };
            updatedAnswers[currentQuestion.id] = 'skip';
            answersRef.current = updatedAnswers;
            
            // Move to next question or complete quiz
            if (currentQuestionIndex < totalQuestions - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              selectedOptionIdRef.current = null;
              setSelectedOptionId(null);
            } else {
              handleQuizComplete();
            }
          }}
          variant="outline"
          className="w-full mt-2"
        >
          I don't know ball
        </Button>
      </CardFooter>
    </Card>
  );
} 