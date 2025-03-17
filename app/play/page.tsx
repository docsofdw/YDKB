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
import { getTodaysChallengePlayer, type Player } from '@/app/lib/supabase-client';
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
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeIsUp, setTimeIsUp] = useState(false);
  
  // Track if the game has been initialized with a game ID
  const gameInitialized = useRef(false);
  
  useEffect(() => {
    setIsClient(true);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Effect to handle time limit expiration
  useEffect(() => {
    if (quizState === 'intro' || quizState === 'summary') return;
    
    const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
    const timeLimit = TIME_LIMITS[currentDifficulty];
    
    if (quizProgress.elapsedTime >= timeLimit) {
      setTimeIsUp(true);
      if (timer) clearInterval(timer);
      
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
    const newTimer = setInterval(() => {
      setQuizProgress(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1
      }));
    }, 1000);
    setTimer(newTimer);
  };

  // Handle when time is up for a question
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
      setUserAnswer('');
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

  const handleSubmitAnswer = async () => {
    if (timer) clearInterval(timer);
    
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
            <span className={timeRemaining < 10 ? "text-error animate-pulse" : ""}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        <div className={`relative h-2 w-full overflow-hidden rounded-full ${
          timePercentage > 66 ? 'bg-success/20' : 
          timePercentage > 33 ? 'bg-warning/20' : 
          'bg-error/20'
        }`}>
          <div 
            className="h-full w-full flex-1 transition-all"
            style={{
              ...indicatorStyle,
              transform: `translateX(-${100 - timePercentage}%)`
            }}
          />
        </div>
      </motion.div>
    );
  };

  const renderQuizContent = () => {
    const currentPlayer = quizProgress.players[quizState as keyof typeof quizProgress.players];
    const timeLimit = TIME_LIMITS[quizState as keyof typeof TIME_LIMITS] || 0;
    const timeRemaining = Math.max(0, timeLimit - quizProgress.elapsedTime);
    const timePercentage = (timeRemaining / timeLimit) * 100;

    return (
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
        
        {renderProgressBar()}
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6 text-gray-100">
              {currentPlayer?.name ? 
                `Where did ${currentPlayer.name} go to college?` :
                'Loading question...'}
            </h2>
            <div className="mb-6">
              <PlayerImage 
                playerName={currentPlayer?.name || ''} 
                size={192} 
                className="mx-auto h-48 w-48 object-cover rounded-xl shadow-lg border border-gray-700"
              />
            </div>
            <div className="max-w-sm mx-auto">
              {timeIsUp ? (
                <div className="relative glass-input-container opacity-50">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userAnswer || "Time's up!"}
                    readOnly
                    className="w-full h-12 pl-11 pr-4 text-base text-gray-100 bg-surface/40 backdrop-blur-md border border-gray-700/50 rounded-xl"
                  />
                </div>
              ) : (
                <CollegeAutocomplete
                  value={userAnswer}
                  onChange={setUserAnswer}
                  onSubmit={handleSubmitAnswer}
                  className="relative glass-input-container"
                />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <button 
              onClick={handleSubmitAnswer}
              className={`glass-button-primary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] mx-auto text-base px-4 py-2.5 rounded-full backdrop-blur-md border text-gray-100 font-medium transition-all duration-300 ${
                !userAnswer.trim() || timeIsUp ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              } ${
                quizState === 'easy' ? 'bg-success/20 border-success/30 hover:bg-success/30 hover:border-success/50 hover:shadow-success/20' :
                quizState === 'hard' ? 'bg-warning/20 border-warning/30 hover:bg-warning/30 hover:border-warning/50 hover:shadow-warning/20' :
                'bg-info/20 border-info/30 hover:bg-info/30 hover:border-info/50 hover:shadow-info/20'
              }`}
              disabled={!userAnswer.trim() || timeIsUp}
            >
              <span>Submit Answer</span>
              <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur ${
                quizState === 'easy' ? 'bg-gradient-to-r from-success/10 to-success/5' :
                quizState === 'hard' ? 'bg-gradient-to-r from-warning/10 to-warning/5' :
                'bg-gradient-to-r from-info/10 to-info/5'
              }`}></div>
            </button>
            
            <button 
              onClick={() => {
                // Set a default "I don't know" answer
                setUserAnswer("I don't know");
                
                // Handle the submission as incorrect
                const currentDifficulty = quizState as 'easy' | 'hard' | 'hof';
                const currentPlayer = quizProgress.players[currentDifficulty];
                const timeTaken = quizProgress.elapsedTime;
                
                // Update quiz progress
                setQuizProgress(prev => {
                  const updatedResults = { ...prev.results };
                  updatedResults[currentDifficulty] = false;
                  
                  const updatedAnswers = { ...prev.answers };
                  updatedAnswers[currentDifficulty] = "I don't know";
                  
                  const updatedTimeTaken = { ...prev.timeTaken };
                  updatedTimeTaken[currentDifficulty] = timeTaken;
                  
                  return {
                    ...prev,
                    currentQuestion: prev.currentQuestion + 1,
                    results: updatedResults,
                    answers: updatedAnswers,
                    timeTaken: updatedTimeTaken
                  };
                });
                
                // Save the result to user history
                if (isSignedIn && currentPlayer && quizProgress.gameId) {
                  saveUserQuestionHistory(quizProgress.gameId, [{
                    game_id: quizProgress.gameId,
                    player_id: currentPlayer.id,
                    answered_correctly: false,
                    time_taken: timeTaken,
                  }]).catch(console.error);
                }
                
                // Move to the next difficulty or summary
                if (timer) clearInterval(timer);
                
                if (currentDifficulty === 'easy') {
                  setQuizState('hard');
                  setUserAnswer(''); // Reset user answer when moving to next question
                  startTimer();
                } else if (currentDifficulty === 'hard') {
                  setQuizState('hof');
                  setUserAnswer(''); // Reset user answer when moving to next question
                  startTimer();
                } else {
                  // Complete the quiz and show summary
                  setQuizState('summary');
                  
                  // Save final game history
                  if (isSignedIn && quizProgress.gameId) {
                    const correctCount = Object.values(quizProgress.results).filter(Boolean).length;
                    const totalTime = Object.values(quizProgress.timeTaken).reduce((sum, time) => sum + (time || 0), 0);
                    
                    // Only pass the fields that saveUserGameHistory expects
                    saveUserGameHistory({
                      game_date: new Date().toISOString(),
                      score: correctCount,
                      correct_answers: correctCount,
                      total_questions: 3,
                      time_taken: totalTime,
                      difficulty: 'daily',
                    }).catch(console.error);
                  }
                }
              }}
              className={`glass-button-secondary group relative flex items-center justify-center gap-2 w-full sm:w-[200px] mx-auto text-base px-4 py-2.5 rounded-full backdrop-blur-md border font-medium transition-all duration-300 hover:shadow-lg ${
                timeIsUp ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                quizState === 'easy' ? 'text-gray-300 border-success/20 hover:border-success/30 hover:text-gray-100' :
                quizState === 'hard' ? 'text-gray-300 border-warning/20 hover:border-warning/30 hover:text-gray-100' :
                'text-gray-300 border-info/20 hover:border-info/30 hover:text-gray-100'
              }`}
              style={{
                background: 'rgba(25, 25, 30, 0.5)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
              }}
              disabled={timeIsUp}
            >
              <span>I don't know ball</span>
              <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur ${
                quizState === 'easy' ? 'bg-gradient-to-r from-success/5 to-success/0' :
                quizState === 'hard' ? 'bg-gradient-to-r from-warning/5 to-warning/0' :
                'bg-gradient-to-r from-info/5 to-info/0'
              }`}></div>
            </button>
          </div>
        </CardFooter>
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