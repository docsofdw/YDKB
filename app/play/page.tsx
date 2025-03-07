'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Trophy, History, Play, ArrowLeft, Timer } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/app/components/ui/progress";
import { getTodaysChallengePlayer, type Player } from '@/app/lib/supabase-client';
import { saveUserGameHistory, saveUserQuestionHistory } from '@/app/lib/user-actions';
import { CollegeAutocomplete } from "@/app/components/CollegeAutocomplete";

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

function PlayerImage({ currentPlayer }: { currentPlayer?: Player }) {
  if (!currentPlayer) {
    return (
      <div className="mb-6 p-4 bg-surface rounded-lg border border-gray-700">
        <p className="text-gray-500">Loading player data...</p>
      </div>
    );
  }
  
  if (!currentPlayer.image_url) {
    return (
      <div className="mb-6 p-4 bg-surface rounded-lg border border-gray-700">
        <p className="text-gray-500">No image available for {currentPlayer.name}</p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <img 
        src={currentPlayer.image_url}
        alt="NFL Player"
        className="mx-auto h-48 w-48 object-cover rounded-xl shadow-lg border border-gray-700"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image';
        }}
      />
    </div>
  );
}

export default function PlayPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [quizProgress, setQuizProgress] = useState<QuizProgress>(INITIAL_QUIZ_PROGRESS);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const startTimer = () => {
    setQuizProgress(prev => ({ ...prev, elapsedTime: 0 }));
    const newTimer = setInterval(() => {
      setQuizProgress(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1
      }));
    }, 1000);
    setTimer(newTimer);
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
    setQuizProgress(prev => {
      console.log('Previous quiz progress:', prev);
      return {
        ...INITIAL_QUIZ_PROGRESS,
        players: prev.players
      };
    });
    setQuizState('easy');
    startTimer();
  };

  const handleSubmitAnswer = async () => {
    if (timer) clearInterval(timer);
    
    const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
    const currentPlayer = quizProgress.players[currentDifficulty];
    const timeTaken = quizProgress.elapsedTime;
    
    // Check answer against college name
    const isCorrect = userAnswer.trim().toLowerCase() === currentPlayer?.college.toLowerCase();
    
    // Update progress
    setQuizProgress(prev => ({
      ...prev,
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

    if (nextState === 'summary') {
      // Save game history
      if (isSignedIn) {
        try {
          const totalTimeTaken = Object.values(quizProgress.timeTaken).reduce((a, b) => a + (b || 0), 0) + timeTaken;
          
          const gameData = {
            game_date: new Date().toISOString(),
            score: quizProgress.score + (isCorrect ? 1 : 0),
            correct_answers: quizProgress.score + (isCorrect ? 1 : 0),
            total_questions: 3,
            time_taken: totalTimeTaken,
            difficulty: 'daily'
          };

          const gameResult = await saveUserGameHistory(gameData);

          if (gameResult.success && gameResult.gameId) {
            const questionData = Object.entries(quizProgress.players).map(([diff, player]) => ({
              game_id: gameResult.gameId,
              player_id: player?.id || 0,
              answered_correctly: quizProgress.results[diff as 'easy' | 'hard' | 'hof'] || false,
              time_taken: quizProgress.timeTaken[diff as 'easy' | 'hard' | 'hof'] || 0
            }));

            await saveUserQuestionHistory(gameResult.gameId, questionData);
          }
        } catch (error) {
          console.error('Error saving game history:', error);
        }
      }
    } else {
      setUserAnswer('');
      setQuizState(nextState as QuizState);
      startTimer(); // Start new timer for next question
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProgressBar = () => {
    if (quizState === 'intro' || quizState === 'summary') return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-4"
      >
        <div className="flex justify-between items-center text-sm text-gray-300">
          <span>Question {quizProgress.currentQuestion + 1} of {quizProgress.totalQuestions}</span>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>{formatTime(quizProgress.elapsedTime)}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderQuizContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={quizState}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {quizState === 'intro' && (
            <>
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 gradient-text">Daily Challenge</h1>
                <p className="text-gray-300 text-lg">Test your NFL knowledge with today's three questions</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary-green">
                      <CalendarDays className="h-5 w-5" />
                      Today's Challenge
                    </CardTitle>
                    <CardDescription className="text-gray-300">Three questions of increasing difficulty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-300" />
                          <span className="text-sm text-gray-300">9 min total</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-gray-300" />
                          <span className="text-sm text-gray-300">3 questions</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
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
                  <CardFooter className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleStartQuiz}
                      className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-4 py-2.5 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play Now</span>
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/10 to-secondary-green/10 blur"></div>
                    </button>
                    
                    <Link href="/archive" className="w-full sm:w-auto">
                      <button
                        className="glass-button-secondary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-4 py-2.5 rounded-full backdrop-blur-md bg-surface/20 border border-gray-700/30 text-gray-300 font-medium transition-all duration-300 hover:bg-surface/40 hover:text-primary-green hover:border-primary-green/30"
                      >
                        <History className="w-4 h-4" />
                        <span>View Archive</span>
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/5 to-secondary-green/5 blur"></div>
                      </button>
                    </Link>
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
          )}

          {(quizState === 'easy' || quizState === 'hard' || quizState === 'hof') && (
            <Card className="w-full glass">
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
                        if (timer) clearInterval(timer);
                        setQuizState('intro');
                      }}
                      className="text-gray-300 hover:text-primary-green p-2 rounded-full transition-colors duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-6 text-gray-100">
                    {quizProgress.players[quizState]?.name ? 
                      `Where did ${quizProgress.players[quizState]?.name} go to college?` :
                      'Loading question...'}
                  </h2>
                  <PlayerImage currentPlayer={quizProgress.players[quizState]} />
                  <div className="max-w-sm mx-auto">
                    <CollegeAutocomplete
                      value={userAnswer}
                      onChange={setUserAnswer}
                      onSubmit={handleSubmitAnswer}
                      className="relative glass-input-container"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <button 
                  onClick={handleSubmitAnswer}
                  className={`glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] mx-auto text-base px-4 py-2.5 rounded-full backdrop-blur-md border text-gray-100 font-medium transition-all duration-300 ${
                    !userAnswer.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                  } ${
                    quizState === 'easy' ? 'bg-success/20 border-success/30 hover:bg-success/30 hover:border-success/50 hover:shadow-success/20' :
                    quizState === 'hard' ? 'bg-warning/20 border-warning/30 hover:bg-warning/30 hover:border-warning/50 hover:shadow-warning/20' :
                    'bg-info/20 border-info/30 hover:bg-info/30 hover:border-info/50 hover:shadow-info/20'
                  }`}
                  disabled={!userAnswer.trim()}
                >
                  <span>Submit Answer</span>
                  <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur ${
                    quizState === 'easy' ? 'bg-gradient-to-r from-success/10 to-success/5' :
                    quizState === 'hard' ? 'bg-gradient-to-r from-warning/10 to-warning/5' :
                    'bg-gradient-to-r from-info/10 to-info/5'
                  }`}></div>
                </button>
              </CardFooter>
            </Card>
          )}

          {quizState === 'summary' && (
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
                            {player?.image_url && (
                              <img 
                                src={player.image_url}
                                alt={player.name}
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
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isClient && !isSignedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center p-8 max-w-md mx-auto glass rounded-xl">
          <h1 className="text-2xl font-bold mb-4 text-gray-100">Sign In Required</h1>
          <p className="mb-6 text-gray-300">Please sign in to play the daily NFL College Guessing Game.</p>
          <button
            onClick={() => window.location.href = '/sign-in'}
            className="glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] text-base px-4 py-2.5 rounded-full backdrop-blur-md bg-surface/30 border border-gray-700/30 text-gray-100 font-medium transition-all duration-300 hover:bg-primary-green/20 hover:border-primary-green/40 hover:shadow-lg hover:shadow-primary-green/20"
          >
            <span>Sign In</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-green/10 to-secondary-green/10 blur"></div>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-2xl mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {renderProgressBar()}
      {renderQuizContent()}
    </motion.div>
  );
} 