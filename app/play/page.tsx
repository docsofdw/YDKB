'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Trophy, History, Play, ArrowLeft, Timer, Search } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/app/components/ui/progress";
import { getTodaysChallengePlayer, type Player, getPlayerImageUrl } from '@/app/lib/supabase-client';
import { saveUserGameHistory, saveUserQuestionHistory } from '@/app/lib/user-actions';
import { CollegeAutocomplete } from "@/app/components/CollegeAutocomplete";
import PlayerImage from '@/app/components/PlayerImage';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

type QuizState = 'intro' | 'easy' | 'hard' | 'hof' | 'summary';

interface QuizProgress {
  currentQuestion: number;
  totalQuestions: number;
  elapsedTime: number;
  score: number;
  gameId?: string;
  answers: {
    easy?: string;
    hard?: string;
    hof?: string;
  };
  players: {
    easy?: Player;
    hard?: Player;
    hof?: Player;
  };
  results: {
    easy?: boolean;
    hard?: boolean;
    hof?: boolean;
  };
  timeTaken: {
    easy?: number;
    hard?: number;
    hof?: number;
  };
}

const INITIAL_QUIZ_PROGRESS: QuizProgress = {
  currentQuestion: 0,
  totalQuestions: 3,
  elapsedTime: 0,
  score: 0,
  answers: {},
  players: {},
  results: {},
  timeTaken: {}
};

const TIME_LIMITS = {
  easy: 120, // 2 minutes in seconds
  hard: 180, // 3 minutes in seconds
  hof: 240,  // 4 minutes in seconds
};

// Define our own interfaces to match what we need
interface GameData {
  game_id?: string;
  game_date: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  difficulty: string;
}

export default function PlayPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [quizProgress, setQuizProgress] = useState<QuizProgress>(INITIAL_QUIZ_PROGRESS);
  const [isLoading, setIsLoading] = useState(false);
  const [timeIsUp, setTimeIsUp] = useState(false);
  
  // Use refs for values that don't need to trigger re-renders
  const userAnswerRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);
  const playersRef = useRef<Record<string, Player>>({});
  const timeTakenRef = useRef<number>(0);
  const gameInitialized = useRef<boolean>(false);
  
  useEffect(() => {
    setIsClient(true);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Effect to handle time limit expiration
  useEffect(() => {
    if (quizState === 'intro' || quizState === 'summary') return;
    
    const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
    const timeLimit = TIME_LIMITS[currentDifficulty];
    
    if (quizProgress.elapsedTime >= timeLimit) {
      setTimeIsUp(true);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      
      // Auto-submit "I don't know" after time is up
      handleTimeUp();
    }
    
    return () => {
      setTimeIsUp(false);
    };
  }, [quizProgress.elapsedTime, quizState]);

  const startTimer = () => {
    setQuizProgress(prev => ({ ...prev, elapsedTime: 0 }));
    setTimeIsUp(false);
    
    let startTime = performance.now();
    
    const tick = (timestamp: number) => {
      const elapsedSeconds = Math.floor((timestamp - startTime) / 1000);
      
      if (elapsedSeconds !== quizProgress.elapsedTime) {
        setQuizProgress(prev => ({
          ...prev,
          elapsedTime: elapsedSeconds
        }));
      }
      
      rafIdRef.current = requestAnimationFrame(tick);
    };
    
    rafIdRef.current = requestAnimationFrame(tick);
  };

  const handleUserAnswerChange = (value: string) => {
    // Store in ref instead of state to prevent re-renders on every keystroke
    userAnswerRef.current = value;
  };

  const handleSubmitAnswer = async () => {
    // Only at submission time, get the value from the ref
    const userAnswer = userAnswerRef.current;
    
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    
    const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
    const currentPlayer = quizProgress.players[currentDifficulty];
    const timeTaken = quizProgress.elapsedTime;
    
    // Normalize college names for comparison
    const normalizeCollegeName = (name: string): string => {
      return name
        .trim()
        .toLowerCase()
        // Handle common abbreviations
        .replace(/^ut\b/, 'texas')
        .replace(/^uf\b/, 'florida')
        .replace(/^um\b/, 'michigan')
        .replace(/^uga\b/, 'georgia')
        .replace(/^osu\b/, 'ohio state')
        .replace(/^psu\b/, 'penn state')
        .replace(/^msu\b/, 'michigan state')
        .replace(/^unc\b/, 'north carolina')
        .replace(/^usc\b/, 'southern california')
        .replace(/^ucla\b/, 'california los angeles')
        // Remove common suffixes and prefixes
        .replace(/university of /i, '')
        .replace(/^the university of /i, '')
        .replace(/ university/i, '')
        .replace(/state university/i, 'state')
        .replace(/ college/i, '')
        // Handle specific cases
        .replace(/^ole miss$/i, 'mississippi')
        .replace(/^uva$/i, 'virginia')
        .replace(/^a&m/i, 'am')
        // Remove special characters
        .replace(/[^\w\s]/g, '')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const userCollegeName = normalizeCollegeName(userAnswer);
    const correctCollegeName = normalizeCollegeName(currentPlayer?.college || '');
    
    // Check if the normalized names match or if the user's answer contains the correct answer
    // or if the correct answer contains the user's answer
    const isCorrect = 
      userCollegeName === correctCollegeName || 
      (userCollegeName.length > 3 && correctCollegeName.includes(userCollegeName)) ||
      (correctCollegeName.length > 3 && userCollegeName.includes(correctCollegeName));
    
    console.log('Answer check:', {
      userAnswer: userAnswer,
      correctAnswer: currentPlayer?.college,
      userNormalized: userCollegeName,
      correctNormalized: correctCollegeName,
      isCorrect
    });
    
    // Update progress
    setQuizProgress(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
      score: isCorrect ? prev.score + 1 : prev.score,
      answers: {
        ...prev.answers,
        [currentDifficulty]: userAnswer
      },
      results: {
        ...prev.results,
        [currentDifficulty]: isCorrect
      },
      timeTaken: {
        ...prev.timeTaken,
        [currentDifficulty]: timeTaken
      }
    }));

    // Move to next question or complete quiz
    const nextState = {
      easy: 'hard',
      hard: 'hof',
      hof: 'summary'
    }[currentDifficulty];

    // Save question history
    if (isSignedIn && currentPlayer && quizProgress.gameId) {
      try {
        await saveUserQuestionHistory(quizProgress.gameId, [{
          game_id: quizProgress.gameId,
          player_id: currentPlayer.id,
          answered_correctly: isCorrect,
          time_taken: timeTaken,
        }]);
      } catch (error) {
        console.error('Error saving question history:', error);
      }
    }

    if (nextState === 'summary') {
      // Update final game history
      if (isSignedIn && quizProgress.gameId) {
        try {
          const totalTimeTaken = Object.values(quizProgress.timeTaken).reduce((a, b) => a + (b || 0), 0) + timeTaken;
          const finalScore = quizProgress.score + (isCorrect ? 1 : 0);
          
          // Only pass the fields that saveUserGameHistory expects
          await saveUserGameHistory({
            game_date: new Date().toISOString(),
            score: finalScore,
            correct_answers: finalScore,
            total_questions: 3,
            time_taken: totalTimeTaken,
            difficulty: 'daily'
          });
        } catch (error) {
          console.error('Error updating game history:', error);
        }
      }
      
      setQuizState('summary');
    } else {
      userAnswerRef.current = '';
      setQuizState(nextState as QuizState);
      startTimer(); // Start new timer for next question
    }
  };

  const handleTimeUp = async () => {
    const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
    const currentPlayer = quizProgress.players[currentDifficulty];
    const timeTaken = TIME_LIMITS[currentDifficulty]; // Use max time when time is up
    
    // Update quiz progress
    setQuizProgress(prev => {
      const updatedResults = { ...prev.results };
      updatedResults[currentDifficulty] = false;
      
      const updatedAnswers = { ...prev.answers };
      updatedAnswers[currentDifficulty] = "Time's up";
      
      const updatedTimeTaken = { ...prev.timeTaken };
      updatedTimeTaken[currentDifficulty] = timeTaken;
      
      return {
        ...prev,
        results: updatedResults,
        answers: updatedAnswers,
        timeTaken: updatedTimeTaken
      };
    });
    
    // Move to next question or complete quiz
    const nextState = {
      easy: 'hard',
      hard: 'hof',
      hof: 'summary'
    }[currentDifficulty];
    
    // Save the result to user history if we have a game ID
    if (isSignedIn && currentPlayer && quizProgress.gameId) {
      try {
        await saveUserQuestionHistory(quizProgress.gameId, [{
          game_id: quizProgress.gameId,
          player_id: currentPlayer.id,
          answered_correctly: false,
          time_taken: timeTaken,
        }]);
      } catch (error) {
        console.error('Error saving question history:', error);
      }
    }
    
    if (nextState === 'summary') {
      // Complete the quiz and show summary
      setQuizState('summary');
      
      // Save final game history if not already saved
      if (isSignedIn && !quizProgress.gameId) {
        try {
          const totalTimeTaken = Object.values(quizProgress.timeTaken).reduce((sum, time) => sum + (time || 0), 0) + timeTaken;
          const correctCount = Object.values(quizProgress.results).filter(Boolean).length;
          
          const gameData = {
            game_date: new Date().toISOString(),
            score: correctCount,
            correct_answers: correctCount,
            total_questions: 3,
            time_taken: totalTimeTaken,
            difficulty: 'daily'
          };
          
          await saveUserGameHistory(gameData);
        } catch (error) {
          console.error('Error saving final game history:', error);
        }
      }
    } else {
      // Move to next question
      userAnswerRef.current = '';
      setQuizState(nextState as QuizState);
      startTimer();
    }
  };

  const loadDailyChallenge = async () => {
    setIsLoading(true);
    try {
      console.log('Loading daily challenge players...');
      // Load all three difficulty levels
      const [easyPlayer, hardPlayer, hofPlayer] = await Promise.all([
        getTodaysChallengePlayer('easy'),
        getTodaysChallengePlayer('hard'),
        getTodaysChallengePlayer('hof')
      ]);

      console.log('Loaded players:', {
        easy: easyPlayer,
        hard: hardPlayer,
        hof: hofPlayer
      });

      setQuizProgress(prev => ({
        ...prev,
        players: {
          easy: easyPlayer,
          hard: hardPlayer,
          hof: hofPlayer
        }
      }));
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    console.log('Starting quiz...');
    await loadDailyChallenge();
    console.log('Setting initial quiz state...');
    
    // Initialize game record if user is signed in
    if (isSignedIn) {
      try {
        const gameData = {
          game_date: new Date().toISOString(),
          score: 0,
          correct_answers: 0,
          total_questions: 3,
          time_taken: 0,
          difficulty: 'daily'
        };
        
        const gameResult = await saveUserGameHistory(gameData);
        
        if (gameResult.success && gameResult.gameId) {
          setQuizProgress(prev => ({
            ...INITIAL_QUIZ_PROGRESS,
            players: prev.players,
            gameId: gameResult.gameId
          }));
          
          gameInitialized.current = true;
        } else {
          setQuizProgress(prev => ({
            ...INITIAL_QUIZ_PROGRESS,
            players: prev.players
          }));
        }
      } catch (error) {
        console.error('Error initializing game record:', error);
        setQuizProgress(prev => ({
          ...INITIAL_QUIZ_PROGRESS,
          players: prev.players
        }));
      }
    } else {
      setQuizProgress(prev => ({
        ...INITIAL_QUIZ_PROGRESS,
        players: prev.players
      }));
    }
    
    setQuizState('easy');
    startTimer();
  };

  const handleSkipQuestion = () => {
    // Implementation of handleSkipQuestion
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProgressBar = () => {
    if (quizState === 'intro' || quizState === 'summary') return null;
    
    const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
    const timeLimit = TIME_LIMITS[currentDifficulty];
    const timeRemaining = Math.max(0, timeLimit - quizProgress.elapsedTime);
    const timePercentage = (timeRemaining / timeLimit) * 100;
    
    // Create a custom class for the indicator based on time remaining
    const indicatorStyle = {
      backgroundColor: timePercentage > 66 ? 'var(--success)' : 
                      timePercentage > 33 ? 'var(--warning)' : 
                      'var(--error)'
    };
    
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return (
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-300">
          <span>Question {quizProgress.currentQuestion + 1} of {quizProgress.totalQuestions}</span>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span 
              className={timeRemaining < 10 ? "text-error" : ""}
              aria-live={timeRemaining < 10 ? "assertive" : "off"}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        <div 
          className={`relative h-2 w-full overflow-hidden rounded-full ${
            timePercentage > 66 ? 'bg-success/20' : 
            timePercentage > 33 ? 'bg-warning/20' : 
            'bg-error/20'
          }`}
        >
          <div 
            className={`h-full w-full flex-1 ${!shouldReduceMotion ? 'transition-all' : ''}`}
            style={{
              ...indicatorStyle,
              transform: `translateX(-${100 - timePercentage}%)`
            }}
          />
        </div>
      </div>
    );
  };

  const renderQuizContent = () => {
    const currentPlayer = quizProgress.players[quizState as keyof typeof quizProgress.players];
    const timeLimit = TIME_LIMITS[quizState as keyof typeof TIME_LIMITS] || 0;
    const timeRemaining = Math.max(0, timeLimit - quizProgress.elapsedTime);
    const timePercentage = (timeRemaining / timeLimit) * 100;

    return (
      <Card className="w-full bg-surface/80 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                quizState === 'easy' ? 'bg-success' :
                quizState === 'hard' ? 'bg-warning' : 'bg-info'
              }`}></div>
              <span className="text-gray-100">
                {quizState === 'easy' ? 'Easy Question' :
                 quizState === 'hard' ? 'Hard Question' : 'Hall of Fame Question'}
              </span>
            </CardTitle>
            {quizState === 'easy' && (
              <button
                onClick={() => {
                  if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
                  setQuizState('intro');
                }}
                className="text-gray-300 hover:text-primary-green p-2 rounded-full transition-colors duration-200 min-h-12 min-w-12"
                aria-label="Back to intro"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardHeader>
        
        {renderProgressBar()}
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-auto flex justify-center">
              <PlayerImage 
                playerId={currentPlayer.id}
                playerName={currentPlayer.name}
                alt={`NFL Player`}
                priority={quizState === 'easy'}
                onLoad={() => {
                  // Prefetch next difficulty's player image when current image loads
                  if (quizState === 'easy') {
                    // Prefetch 'hard' difficulty player
                    const hardPlayer = quizProgress.players.hard;
                    if (hardPlayer && hardPlayer.id) {
                      const img = new Image();
                      img.src = getPlayerImageUrl(hardPlayer.id);
                    }
                  } else if (quizState === 'hard') {
                    // Prefetch 'hof' difficulty player
                    const hofPlayer = quizProgress.players.hof;
                    if (hofPlayer && hofPlayer.id) {
                      const img = new Image();
                      img.src = getPlayerImageUrl(hofPlayer.id);
                    }
                  }
                }}
                size="large"
              />
            </div>
            
            <div className="w-full space-y-4">
              <p className="text-lg font-medium text-center md:text-left">
                Which college did this player attend?
              </p>
              
              <div className="flex flex-col gap-3">
                <CollegeAutocomplete
                  value={userAnswerRef.current}
                  onChange={handleUserAnswerChange}
                  onSubmit={handleSubmitAnswer}
                  className="w-full"
                />
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmitAnswer}
                    className="flex-1 min-h-12"
                    disabled={!userAnswerRef.current.trim()}
                  >
                    Submit
                  </Button>
                  
                  <Button
                    onClick={handleSkipQuestion}
                    variant="outline"
                    className="flex-1 min-h-12"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSummary = () => {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-primary-green">Quiz Complete!</CardTitle>
          <CardDescription className="text-gray-300">Here's how you did</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2 gradient-text">
                {Math.round((quizProgress.score / 3) * 100)}%
              </div>
              <p className="text-xl mb-1 text-gray-100">
                You got {quizProgress.score} out of 3 questions correct
              </p>
              <p className="text-sm text-gray-500">
                Total time: {formatTime(Object.values(quizProgress.timeTaken).reduce((a, b) => a + (b || 0), 0))}
              </p>
            </div>

            <div className="space-y-4">
              {(['easy', 'hard', 'hof'] as const).map((difficulty) => {
                const player = quizProgress.players[difficulty];
                const answer = quizProgress.answers[difficulty];
                const isCorrect = quizProgress.results[difficulty];
                const timeTaken = quizProgress.timeTaken[difficulty];

                return (
                  <div 
                    key={difficulty}
                    className={`p-4 rounded-lg glass ${
                      isCorrect ? 'border-success/20' : 'border-error/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {player && (
                        <PlayerImage 
                          playerId={player.id} 
                          playerName={player.name}
                          size={64} 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            difficulty === 'easy' ? 'bg-success' :
                            difficulty === 'hard' ? 'bg-warning' : 'bg-info'
                          }`} />
                          <span className="font-medium text-gray-100">
                            {difficulty === 'easy' ? 'Easy' :
                             difficulty === 'hard' ? 'Hard' : 'Hall of Fame'} Question
                          </span>
                        </div>
                        <p className="text-sm mb-1 text-gray-300">
                          Your answer: <span className={isCorrect ? 'text-success' : 'text-error'}>
                            {answer}
                          </span>
                        </p>
                        {!isCorrect && player && (
                          <p className="text-sm text-success">
                            Correct answer: {player.college}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Time taken: {formatTime(timeTaken || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              setQuizState('intro');
              setQuizProgress(INITIAL_QUIZ_PROGRESS);
            }}
            className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-4 py-2.5 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20"
          >
            <span>Play Again</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/10 to-secondary-green/10 blur"></div>
          </button>
          
          <Link href="/leaderboard" className="w-full sm:w-auto">
            <button
              className="glass-button-secondary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-4 py-2.5 rounded-full backdrop-blur-md bg-surface/20 border border-gray-700/30 text-gray-300 font-medium transition-all duration-300 hover:bg-surface/40 hover:text-primary-green hover:border-primary-green/30"
            >
              <span>View Leaderboard</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/5 to-secondary-green/5 blur"></div>
            </button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  const renderIntro = () => {
    return (
      <>
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">Daily Challenge</h1>
          <p className="text-gray-300 text-base md:text-lg max-w-md mx-auto">Test your NFL knowledge with today's three questions</p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-md mx-auto">
          <Card className="glass hover:shadow-xl transition-all duration-300 border-t border-gray-700/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary-green text-xl">
                <CalendarDays className="h-5 w-5" />
                Today's Challenge
              </CardTitle>
              <CardDescription className="text-gray-300">Three questions of increasing difficulty</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-300" />
                    <span className="text-sm text-gray-300">9 min total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-300" />
                    <span className="text-sm text-gray-300">3 questions</span>
                  </div>
                </div>
                
                <div className="space-y-3 py-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="text-gray-300">Easy Question (2 min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    <span className="text-gray-300">Hard Question (3 min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-info"></div>
                    <span className="text-gray-300">Hall of Fame Question (4 min)</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-1 pb-4 px-6">
              <Button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-5 py-2 h-auto"
                variant="default"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>
              
              <Button 
                variant="outline" 
                asChild 
                className="w-full sm:w-auto px-4 py-2 h-auto"
              >
                <Link href="/archive">
                  <History className="w-4 h-4 mr-2" />
                  View Archive
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Questions refresh daily at midnight EST
          </p>
        </motion.div>
      </>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (isClient && !isSignedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="text-center p-6 max-w-md mx-auto glass rounded-xl shadow-lg border-t border-gray-700/30 w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-100">Sign In Required</h1>
          <p className="mb-6 text-gray-300">Please sign in to play the daily NFL College Guessing Game.</p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-5 py-3 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20"
            >
              <span>Sign In</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/10 to-secondary-green/10 blur"></div>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {isLoading ? (
        <div className="w-full max-w-md mx-auto">
          <Card className="glass shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={quizState}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {quizState === 'intro' && renderIntro()}
              {quizState === 'summary' && renderSummary()}
              {(quizState === 'easy' || quizState === 'hard' || quizState === 'hof') && renderQuizContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
} 