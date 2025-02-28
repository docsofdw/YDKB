'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { RefreshCw, Trophy, XCircle, AlertTriangle } from 'lucide-react';
import CollegeSearch from './CollegeSearch';
import useGameState from '@/app/hooks/useGameState';
import Image from 'next/image';
import { Player } from '@/app/types/game';

interface PlayerCardProps {
  player: Player;
  date?: string;
  onComplete?: (difficulty: string, isCorrect: boolean, attempts: number) => void;
  className?: string;
}

export default function PlayerCard({ 
  player, 
  date,
  onComplete,
  className = ""
}: PlayerCardProps) {
  const [activeTab, setActiveTab] = useState('guess');
  
  // Use the game state hook
  const {
    loading,
    attempts,
    correctGuess,
    gaveUp,
    guesses,
    gameComplete,
    makeGuess,
    giveUp,
    resetGame,
    maxAttempts
  } = useGameState(date, player?.id);
  
  // Enhanced player bio with more details
  const playerBio = player ? `${player.name} is a ${player.position} who played college football at ${player.college}. ${player.bio || ''}` : '';
  const collegeBio = player ? `${player.name} had a successful career at ${player.college} before entering the NFL. ${player.collegeBio || ''}` : '';
  
  // When the game completes, notify the parent component
  useEffect(() => {
    if (gameComplete && onComplete) {
      onComplete(player.difficulty?.toLowerCase() || 'easy', correctGuess, attempts);
    }
  }, [gameComplete, correctGuess, attempts, player, onComplete]);
  
  // When game completes, show result tab
  useEffect(() => {
    if (gameComplete) {
      setActiveTab('result');
    }
  }, [gameComplete]);
  
  // Handle a new guess
  const handleGuess = async (collegeName: string) => {
    const result = await makeGuess(collegeName, player.college);
    
    if (result) {
      // If correct, show the result tab
      setActiveTab('result');
    }
  };
  
  // Handle giving up
  const handleGiveUp = () => {
    giveUp();
    setActiveTab('result');
  };
  
  // Determine badge color based on difficulty
  const difficultyColor = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'Hard': 'bg-orange-100 text-orange-800',
    'Hall of Fame': 'bg-purple-100 text-purple-800'
  }[player?.difficulty || 'Easy'];
  
  // Get game status for display with icons
  const getStatus = () => {
    if (correctGuess) return { 
      label: 'Correct!', 
      color: 'bg-green-500 text-white',
      icon: <Trophy className="mr-1 h-4 w-4" />
    };
    if (gaveUp) return { 
      label: 'Gave Up', 
      color: 'bg-yellow-500 text-white',
      icon: <AlertTriangle className="mr-1 h-4 w-4" />
    };
    if (attempts >= maxAttempts) return { 
      label: 'Incorrect', 
      color: 'bg-red-500 text-white',
      icon: <XCircle className="mr-1 h-4 w-4" />
    };
    return null;
  };
  
  const status = getStatus();
  
  if (!player) {
    return (
      <Card className={`w-full mx-auto ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading player data...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`w-full mx-auto ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge className={difficultyColor}>
            {player.difficulty}
          </Badge>
          {status && (
            <Badge className={`flex items-center ${status.color}`}>
              {status.icon}
              {status.label}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl sm:text-2xl">{player.name}</CardTitle>
        <CardDescription>Position: {player.position}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-center mb-4">
          {player.imageUrl ? (
            <div className="relative h-48 w-48 rounded-md overflow-hidden">
              <Image 
                src={player.imageUrl} 
                alt={player.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            </div>
          ) : (
            <div className="bg-gray-200 rounded-md flex items-center justify-center h-48 w-48 text-gray-500">
              Player Image
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="guess">Guess</TabsTrigger>
            <TabsTrigger value="result" disabled={!gameComplete}>
              Result
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="guess" className="py-4">
            <p className="text-gray-600 mb-4">
              Which college did {player.name} attend?
            </p>
            
            <CollegeSearch 
              onGuess={handleGuess}
              attempts={attempts}
              maxAttempts={maxAttempts}
              guesses={guesses}
              gameComplete={gameComplete}
              onGiveUp={handleGiveUp}
            />
          </TabsContent>
          
          <TabsContent value="result" className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">College: {player.college}</h3>
                <p className="text-gray-600 mt-2">{collegeBio}</p>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg">NFL Bio</h3>
                <p className="text-gray-600 mt-2">{playerBio}</p>
              </div>
              
              {player.stats && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg">Career Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {Object.entries(player.stats).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">{key}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetGame}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          {correctGuess ? `Solved in ${attempts} ${attempts === 1 ? 'guess' : 'guesses'}!` : 
           gameComplete ? `The correct answer was ${player.college}` : ''}
        </p>
        {!gameComplete && (
          <p className="text-xs text-gray-500">
            {maxAttempts - attempts} {maxAttempts - attempts === 1 ? 'guess' : 'guesses'} remaining
          </p>
        )}
      </CardFooter>
    </Card>
  );
} 