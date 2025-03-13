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

type QuizState = 'loading' | 'ready' | 'in-progress' | 'completed' | 'error';

export default function DailyQuiz() {
  const { isSignedIn, isLoaded } = useUser();
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [player, setPlayer] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
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

  const loadDailyChallenge = async () => {
    try {
      setQuizState('loading');
      setError(null);
      
      const playerData = await getTodaysChallengePlayer('easy');
      if (!playerData) {
        throw new Error('Failed to load daily challenge');
      }
      
      setPlayer(playerData);
      setQuizState('ready');
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-lg mb-4">Please sign in to play the daily challenge.</p>
          <Button asChild>
            <a href="/sign-in">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (quizState === 'error') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-500">{error}</p>
            <Button onClick={loadDailyChallenge}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizState === 'loading') {
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

  if (quizState === 'ready') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Challenge</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>1 Question</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Time Attack</span>
              </div>
            </div>
            <p className="text-lg">Ready to test your NFL knowledge?</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startQuiz} className="w-full">Start Challenge</Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizState === 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Complete!</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            <p>Time: {formatTime(timeElapsed)}</p>
            <p>Correct Answer: {player.name}</p>
            <div className="mt-2">
              <PlayerImage 
                playerName={player.name} 
                size={128} 
                className="h-32 w-32 object-cover rounded-lg shadow-lg mx-auto"
              />
            </div>
            <p>Your Answer: {userAnswer}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <a href="/play">Return to Play</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Challenge</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
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
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Who is this NFL player?</h2>
            
            <div className="flex justify-center">
              <PlayerImage 
                playerName={player.name} 
                size={192} 
                className="h-48 w-48 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter player name"
                className="text-center"
                onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                autoFocus
              />
              <Button 
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim()}
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