'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { X, Check, AlertCircle } from "lucide-react";
import { getRandomPlayer, getTodaysChallengePlayer, getColleges } from "../lib/supabase-client";
import { setupJQueryFix, cleanupJQueryFix } from "../utils/jquery-fix";

// Declare jQuery types to prevent TypeScript errors
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface Player {
  id: string;
  name: string;
  position: string;
  college: string;
  team?: string;
  image_url?: string;
}

interface College {
  id: string;
  name: string;
}

export default function PlayPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  
  // Game state
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<{text: string, correct: boolean}[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | 'hof' | 'random'>('easy');
  const [collegeList, setCollegeList] = useState<College[]>([]);
  
  // Maximum attempts allowed
  const MAX_ATTEMPTS = 3;
  
  // Prevent jQuery errors
  useEffect(() => {
    setupJQueryFix();
    
    // Cleanup function to prevent memory leaks
    return () => {
      cleanupJQueryFix();
    };
  }, []);
  
  // Fetch player data based on difficulty
  const fetchPlayerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let playerData: Player | null;
      
      console.log(`Fetching player data for difficulty: ${difficulty}`);
      
      if (difficulty === 'random') {
        playerData = await getRandomPlayer() as Player;
      } else {
        playerData = await getTodaysChallengePlayer(difficulty) as Player;
      }
      
      if (!playerData) {
        console.error('No player data received');
        setError('Failed to load player data. Please try again.');
        return;
      }
      
      if (!playerData.id || !playerData.name) {
        console.error('Invalid player data received:', playerData);
        setError('Received incomplete player data. Please try again.');
        return;
      }
      
      // Check if player has a college field
      if (!playerData.college) {
        console.error('Player has no college data:', playerData);
        setError('Selected player has no college data. Please try again or select a different difficulty.');
        return;
      }
      
      // Ensure player has all required fields
      const safePlayer = {
        id: playerData.id,
        name: playerData.name,
        position: playerData.position || 'Unknown',
        college: playerData.college,
        team: playerData.team || undefined,
        image_url: playerData.image_url || undefined
      };
      
      console.log('Successfully loaded player:', safePlayer.name);
      setPlayer(safePlayer);
    } catch (err) {
      console.error('Error fetching player:', err);
      setError('An error occurred while loading player data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch colleges for suggestions
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const colleges = await getColleges();
        if (colleges && colleges.length > 0) {
          setCollegeList(colleges);
        } else {
          // Fallback college list if none are found in the database
          const fallbackColleges = [
            { id: '1', name: 'Alabama' },
            { id: '2', name: 'Ohio State' },
            { id: '3', name: 'Georgia' },
            { id: '4', name: 'Clemson' },
            { id: '5', name: 'Michigan' },
            { id: '6', name: 'Texas' },
            { id: '7', name: 'Oklahoma' },
            { id: '8', name: 'LSU' },
            { id: '9', name: 'Notre Dame' },
            { id: '10', name: 'Florida' },
            { id: '11', name: 'Texas Tech' },
            { id: '12', name: 'USC' },
            { id: '13', name: 'Oregon' },
            { id: '14', name: 'Penn State' },
            { id: '15', name: 'Miami' }
          ];
          setCollegeList(fallbackColleges);
          console.warn('Using fallback college list as none were found in the database');
        }
      } catch (err) {
        console.error('Error loading colleges:', err);
        // Use fallback list on error
        setCollegeList([
          { id: '1', name: 'Alabama' },
          { id: '2', name: 'Ohio State' },
          { id: '3', name: 'Georgia' },
          { id: '4', name: 'Clemson' },
          { id: '5', name: 'Michigan' }
        ]);
      }
    };
    
    loadColleges();
  }, []);
  
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login');
    } else if (isLoaded) {
      fetchPlayerData();
    }
  }, [isLoaded, userId, router, difficulty]);
  
  // Handle input change and show college suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuess(value);
    
    if (value.length >= 2) {
      // Filter colleges based on input
      const filtered = collegeList
        .filter(college => 
          college.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(college => college.name);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle guess submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player || gameStatus !== 'playing') return;
    
    const trimmedGuess = guess.trim();
    if (!trimmedGuess) return;
    
    // Check if player has a college field
    if (!player.college) {
      setError('This player has no college data. Please try another player.');
      return;
    }
    
    // Check if guess is correct (case insensitive)
    const isCorrect = trimmedGuess.toLowerCase() === player.college.toLowerCase();
    
    // Add to attempts array
    const newAttempts = [...attempts, {text: trimmedGuess, correct: isCorrect}];
    setAttempts(newAttempts);
    
    if (isCorrect) {
      setGameStatus('won');
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      setGameStatus('lost');
    }
    
    // Clear the input and suggestions
    setGuess('');
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (college: string) => {
    setGuess(college);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  // Reset the game
  const resetGame = () => {
    setGuess('');
    setAttempts([]);
    setGameStatus('playing');
    setLoading(true); // Set loading to true before fetching new player
    
    // Use setTimeout to ensure state updates before fetching new data
    setTimeout(() => {
      fetchPlayerData()
        .catch(err => {
          console.error('Error in resetGame:', err);
          setError('Failed to load the next player. Please try again.');
        })
        .finally(() => {
          // Ensure loading is set to false even if there's an error
          setLoading(false);
        });
    }, 100);
  };
  
  // Change difficulty
  const handleDifficultyChange = (newDifficulty: 'easy' | 'hard' | 'hof' | 'random') => {
    if (difficulty !== newDifficulty) {
      setDifficulty(newDifficulty);
      setGuess('');
      setAttempts([]);
      setGameStatus('playing');
      setLoading(true); // Set loading to true before fetching new player
      
      // Use setTimeout to ensure state updates before fetching new data
      setTimeout(() => {
        fetchPlayerData()
          .catch(err => {
            console.error('Error in handleDifficultyChange:', err);
            setError('Failed to load player with the selected difficulty. Please try again.');
          })
          .finally(() => {
            // Ensure loading is set to false even if there's an error
            setLoading(false);
          });
      }, 100);
    }
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      console.log('Connection test results:', data);
      alert(`Connection test: ${data.status === 'ok' ? 'Success' : 'Failed'}\n\nPlayers table: ${data.tables.players.exists ? 'Exists' : 'Missing'}\nColleges table: ${data.tables.colleges.exists ? 'Exists' : 'Missing'}\nChallenges table: ${data.tables.daily_challenges.exists ? 'Exists' : 'Missing'}`);
    } catch (err) {
      console.error('Error testing connection:', err);
      alert('Failed to test connection. Check console for details.');
    }
  };

  // Don't render anything until auth is loaded
  if (!isLoaded || !userId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-highlight-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-silver-gray">Loading game...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-highlight-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-silver-gray">Loading player data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-16 h-16 text-penalty-red mx-auto mb-4" />
        <p className="text-lg text-silver-gray">{error}</p>
        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={resetGame}
            className="btn-primary"
          >
            Try Again
          </button>
          <button 
            onClick={testDatabaseConnection}
            className="btn-secondary"
          >
            Test Database Connection
          </button>
        </div>
      </div>
    );
  }
  
  if (!player) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-16 h-16 text-penalty-red mx-auto mb-4" />
        <p className="text-lg text-silver-gray">No player data available</p>
        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={resetGame}
            className="btn-primary"
          >
            Try Again
          </button>
          <button 
            onClick={testDatabaseConnection}
            className="btn-secondary"
          >
            Test Database Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-6">
      <div className="card p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Today's Challenge</h1>
          <p className="text-silver-gray text-sm">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        </div>
        
        {/* Difficulty selector */}
        <div className="flex justify-center gap-2 mb-8">
          <button 
            onClick={() => handleDifficultyChange('easy')}
            className={`px-3 py-1 rounded-full text-sm ${
              difficulty === 'easy' 
                ? 'bg-highlight-blue text-white' 
                : 'bg-deep-slate text-silver-gray'
            }`}
          >
            Easy
          </button>
          <button 
            onClick={() => handleDifficultyChange('hard')}
            className={`px-3 py-1 rounded-full text-sm ${
              difficulty === 'hard' 
                ? 'bg-highlight-blue text-white' 
                : 'bg-deep-slate text-silver-gray'
            }`}
          >
            Hard
          </button>
          <button 
            onClick={() => handleDifficultyChange('hof')}
            className={`px-3 py-1 rounded-full text-sm ${
              difficulty === 'hof' 
                ? 'bg-highlight-blue text-white' 
                : 'bg-deep-slate text-silver-gray'
            }`}
          >
            Hall of Fame
          </button>
          <button 
            onClick={() => handleDifficultyChange('random')}
            className={`px-3 py-1 rounded-full text-sm ${
              difficulty === 'random' 
                ? 'bg-highlight-blue text-white' 
                : 'bg-deep-slate text-silver-gray'
            }`}
          >
            Random
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            {gameStatus === 'won' ? 'Correct! 🎉' : 
             gameStatus === 'lost' ? `Game Over! The answer was ${player.college}` : 
             'Guess the college of this NFL player'}
          </h2>
        </div>
        
        {/* Player image */}
        <div className="mb-6 flex justify-center">
          <div className="w-48 h-48 bg-midnight-navy rounded-full overflow-hidden flex items-center justify-center">
            {player.image_url ? (
              <img 
                src={player.image_url} 
                alt={player.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-silver-gray">
                {player.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        {/* Player name */}
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold">{player.name}</h3>
          <p className="text-silver-gray text-sm mt-1">{player.position}</p>
          {player.team && <p className="text-silver-gray text-sm">{player.team}</p>}
        </div>
        
        {/* Previous attempts */}
        {attempts.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-silver-gray mb-2">Previous guesses:</p>
            <div className="flex flex-col gap-2">
              {attempts.map((attempt, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md flex items-center justify-between ${
                    attempt.correct 
                      ? 'bg-victory-green bg-opacity-20 border border-victory-green' 
                      : 'bg-penalty-red bg-opacity-20 border border-penalty-red'
                  }`}
                >
                  <span>{attempt.text}</span>
                  {attempt.correct ? (
                    <Check className="w-5 h-5 text-victory-green" />
                  ) : (
                    <X className="w-5 h-5 text-penalty-red" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Attempt indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(MAX_ATTEMPTS)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < attempts.length 
                  ? attempts[i].correct 
                    ? 'bg-victory-green' 
                    : 'bg-penalty-red' 
                  : 'border-2 border-silver-gray'
              }`}
            />
          ))}
        </div>
        
        {/* Guess form */}
        {gameStatus === 'playing' ? (
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={guess}
              onChange={handleInputChange}
              placeholder="Enter college name..."
              className="input-field w-full mb-4 py-3 text-lg"
              autoComplete="off"
            />
            
            {/* College suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 w-full bg-midnight-navy border border-silver-gray rounded-input shadow-card max-h-60 overflow-auto">
                {suggestions.map((college, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 cursor-pointer hover:bg-deep-slate"
                    onClick={() => handleSelectSuggestion(college)}
                  >
                    {college}
                  </div>
                ))}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary w-full py-3 text-lg"
              disabled={!guess.trim()}
            >
              Submit Guess
            </button>
          </form>
        ) : (
          <button 
            onClick={resetGame}
            className="btn-primary w-full py-3 text-lg"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
} 