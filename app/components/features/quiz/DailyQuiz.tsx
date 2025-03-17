'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import { Clock, Trophy, AlertCircle } from 'lucide-react';
import { getTodaysChallengePlayer } from '@/app/lib/supabase-client';
import { saveUserGameHistory, saveUserQuestionHistory } from '@/app/lib/user-actions';
import PlayerImage from '@/app/components/PlayerImage';
import { createSafeClient } from '@/app/lib/supabase-client';

type QuizState = 'loading' | 'ready' | 'in-progress' | 'completed' | 'error';

export default function DailyQuiz() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [player, setPlayer] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      checkCompletionStatus();
      loadDailyChallenge();
    }
  }, [isSignedIn]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState === 'in-progress' && startTime) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, startTime]);

  const checkCompletionStatus = async () => {
    if (!user) return;
    
    try {
      const supabase = createSafeClient();
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('game_history')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('difficulty', 'daily')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error checking completion status:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setHasCompletedToday(true);
        setLastCompletionDate(data[0].created_at);
      } else {
        setHasCompletedToday(false);
        setLastCompletionDate(null);
      }
    } catch (err) {
      console.error('Error checking completion status:', err);
    }
  };

  const loadDailyChallenge = async () => {
    try {
      setQuizState('loading');
      setError(null);
      
      const timestamp = Date.now();
      const playerData = await getTodaysChallengePlayer('easy');
      if (!playerData) {
        throw new Error('Failed to load daily challenge');
      }
      
      setPlayer(playerData);
      
      if (hasCompletedToday) {
        setQuizState('completed');
      } else {
        setQuizState('ready');
      }
    } catch (err) {
      setError('Failed to load daily challenge. Please try again later.');
      setQuizState('error');
    }
  };

  const startQuiz = () => {
    setQuizState('in-progress');
    setStartTime(Date.now());
    setUserAnswer('');
    setIsCorrect(null);
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;

    const isAnswerCorrect = userAnswer.trim().toLowerCase() === player.name.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setQuizState('completed');

    if (isSignedIn) {
      try {
        const gameData = {
          score: isAnswerCorrect ? 1 : 0,
          correct_answers: isAnswerCorrect ? 1 : 0,
          total_questions: 1,
          time_taken: timeElapsed,
          difficulty: 'daily',
        };
        
        const gameResult = await saveUserGameHistory(gameData);
        
        if (gameResult.success && gameResult.gameId) {
          await saveUserQuestionHistory(gameResult.gameId, [{
            player_id: player.id,
            answered_correctly: isAnswerCorrect,
            time_taken: timeElapsed,
          }]);
        }
      } catch (err) {
        // Silent fail for game history
        console.error('Failed to save game history:', err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoaded) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-lg mb-6">Please sign in to play the daily challenge.</p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="/sign-in">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (quizState === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-500 text-center">{error}</p>
            <Button onClick={loadDailyChallenge} className="mt-2">Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizState === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Daily Challenge</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>1 Question</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Time Attack</span>
              </div>
            </div>
            <p className="text-lg text-center py-4">Ready to test your NFL knowledge?</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={startQuiz} size="lg" className="w-full sm:w-auto px-8">Start Challenge</Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizState === 'completed' && hasCompletedToday && !isCorrect && !userAnswer) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Daily Challenge Completed</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="text-2xl font-bold text-green-500">
              You've already completed today's challenge!
            </div>
            <p>Come back tomorrow for a new challenge.</p>
            <div className="mt-4 mb-2">
              <PlayerImage 
                playerName={player?.name || 'Unknown Player'} 
                size={160} 
                className="h-40 w-40 object-cover rounded-lg shadow-lg mx-auto"
              />
            </div>
            <p className="text-lg font-medium">Today's Player: {player?.name}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button asChild size="lg" className="w-full sm:w-auto px-8">
            <a href="/play">Return to Play</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizState === 'completed') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Challenge Complete!</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 items-center text-center">
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            <p className="text-lg">Time: {formatTime(timeElapsed)}</p>
            <div className="mt-2 mb-4">
              <PlayerImage 
                playerName={player.name} 
                size={160} 
                className="h-40 w-40 object-cover rounded-lg shadow-lg mx-auto"
              />
            </div>
            <div className="space-y-2 w-full">
              <p className="font-medium">Correct Answer: <span className="font-bold">{player.name}</span></p>
              <p className="font-medium">Your Answer: <span className="font-bold">{userAnswer}</span></p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button asChild size="lg" className="w-full sm:w-auto px-8">
            <a href="/play">Return to Play</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Daily Challenge</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Question 1/1</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>
          
          <Progress value={100} className="w-full" />
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">Who is this NFL player?</h2>
            
            <div className="flex justify-center my-4">
              <PlayerImage 
                playerName={player.name} 
                size={200} 
                className="h-48 w-48 sm:h-52 sm:w-52 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              <Input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter player name"
                className="text-center py-6 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                autoFocus
              />
              <Button 
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim()}
                size="lg"
                className="mt-2"
              >
                Submit Answer
              </Button>
              <Button 
                onClick={() => {
                  setUserAnswer("I don't know");
                  setIsCorrect(false);
                  setQuizState('completed');
                  
                  if (isSignedIn) {
                    try {
                      const gameData = {
                        score: 0,
                        correct_answers: 0,
                        total_questions: 1,
                        time_taken: timeElapsed,
                        difficulty: 'daily',
                      };
                      
                      saveUserGameHistory(gameData).then(gameResult => {
                        if (gameResult.success && gameResult.gameId) {
                          saveUserQuestionHistory(gameResult.gameId, [{
                            player_id: player.id,
                            answered_correctly: false,
                            time_taken: timeElapsed,
                          }]);
                        }
                      }).catch(err => {
                        console.error('Failed to save game history:', err);
                      });
                    } catch (err) {
                      console.error('Failed to save game history:', err);
                    }
                  }
                }}
                variant="outline"
                className="mt-2"
              >
                I don't know ball
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 