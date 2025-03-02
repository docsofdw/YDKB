'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { X, Check, AlertCircle, ChevronRight, Trophy, Zap, RotateCcw, Gamepad2 } from "lucide-react";
import { getRandomPlayer, getTodaysChallengePlayer, getColleges } from "../lib/supabase-client";
import { setupJQueryFix, cleanupJQueryFix } from "../utils/jquery-fix";
import { motion, AnimatePresence } from "framer-motion";

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

interface GameMode {
  id: 'easy' | 'hard' | 'hof' | 'random';
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
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
  
  // New state for game mode selection
  const [gameScreen, setGameScreen] = useState<'selection' | 'game'>('selection');
  
  // Maximum attempts allowed
  const MAX_ATTEMPTS = 3;
  
  // Game modes
  const gameModes: GameMode[] = [
    {
      id: 'easy',
      title: 'Rookie Mode',
      description: 'Current NFL stars and well-known players',
      icon: <Gamepad2 className="w-6 h-6" />,
      color: 'var(--easy)'
    },
    {
      id: 'hard',
      title: 'Pro Mode',
      description: 'More challenging players from recent seasons',
      icon: <Zap className="w-6 h-6" />,
      color: 'var(--hard)'
    },
    {
      id: 'hof',
      title: 'Hall of Fame',
      description: 'Legendary players from NFL history',
      icon: <Trophy className="w-6 h-6" />,
      color: 'var(--hall-of-fame)'
    },
    {
      id: 'random',
      title: 'Random Challenge',
      description: 'Any player from the NFL database',
      icon: <RotateCcw className="w-6 h-6" />,
      color: 'var(--highlight-blue)'
    }
  ];
  
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
    } else if (isLoaded && gameScreen === 'game') {
      fetchPlayerData();
    }
  }, [isLoaded, userId, router, difficulty, gameScreen]);
  
  // Handle game mode selection
  const handleGameModeSelect = (mode: 'easy' | 'hard' | 'hof' | 'random') => {
    setDifficulty(mode);
    setGameScreen('game');
  };
  
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
  
  // Change difficulty and return to selection screen
  const changeGameMode = () => {
    setGuess('');
    setAttempts([]);
    setGameStatus('playing');
    setGameScreen('selection');
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

  // Game Mode Selection Screen
  if (gameScreen === 'selection') {
    return (
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">Select Game Mode</h1>
          <p className="text-silver-gray text-lg">Choose your challenge level</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="card hover:shadow-lg cursor-pointer overflow-hidden"
              style={{ transform: 'none' }} // Override the default card hover scale
              onClick={() => handleGameModeSelect(mode.id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                  >
                    {mode.icon}
                  </div>
                  <ChevronRight className="w-5 h-5 text-silver-gray" />
                </div>
                <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                <p className="text-silver-gray">{mode.description}</p>
              </div>
              <div 
                className="h-1.5" 
                style={{ backgroundColor: mode.color }}
              ></div>
            </motion.div>
          ))}
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
      <div className="card p-8 text-center max-w-xl mx-auto mt-10">
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
            onClick={changeGameMode}
            className="btn-secondary"
          >
            Change Game Mode
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
      <div className="card p-8 text-center max-w-xl mx-auto mt-10">
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
            onClick={changeGameMode}
            className="btn-secondary"
          >
            Change Game Mode
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

  // Get current game mode info
  const currentMode = gameModes.find(mode => mode.id === difficulty) || gameModes[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="game-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-xl mx-auto pt-6 px-4"
      >
        <motion.div 
          className="card p-8 mb-8"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-2"
              style={{ backgroundColor: `${currentMode.color}20`, color: currentMode.color }}
            >
              {currentMode.icon}
              <span>{currentMode.title}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Today's Challenge</h1>
          </div>
          
          {/* Back to game modes button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={changeGameMode}
            className="flex items-center gap-2 text-silver-gray hover:text-chalk-white transition-colors mb-6 text-sm"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Change Game Mode</span>
          </motion.button>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              {gameStatus === 'won' ? 'Correct! 🎉' : 
               gameStatus === 'lost' ? `Game Over! The answer was ${player.college}` : 
               'Guess the college of this NFL player'}
            </h2>
          </div>
          
          {/* Player image */}
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-48 h-48 bg-midnight-navy rounded-full overflow-hidden flex items-center justify-center shadow-lg">
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
          </motion.div>
          
          {/* Player name */}
          <motion.div 
            className="text-center mb-10"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold">{player.name}</h3>
            <p className="text-silver-gray text-sm mt-1">{player.position}</p>
            {player.team && <p className="text-silver-gray text-sm">{player.team}</p>}
          </motion.div>
          
          {/* Previous attempts */}
          <AnimatePresence>
            {attempts.length > 0 && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-silver-gray mb-2">Previous guesses:</p>
                <div className="flex flex-col gap-2">
                  {attempts.map((attempt, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
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
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Attempt indicators */}
          <div className="flex justify-center gap-3 mb-8">
            {[...Array(MAX_ATTEMPTS)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  backgroundColor: i < attempts.length 
                    ? attempts[i].correct 
                      ? 'var(--victory-green)' 
                      : 'var(--penalty-red)' 
                    : 'transparent'
                }}
                transition={{ duration: 0.3, delay: i * 0.1 + 0.4 }}
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
            <motion.form 
              onSubmit={handleSubmit} 
              className="relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <input
                type="text"
                value={guess}
                onChange={handleInputChange}
                placeholder="Enter college name..."
                className="input-field w-full mb-4 py-3 text-lg"
                autoComplete="off"
              />
              
              {/* College suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full bg-midnight-navy border border-silver-gray rounded-input shadow-card max-h-60 overflow-auto"
                  >
                    {suggestions.map((college, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="px-4 py-3 cursor-pointer hover:bg-deep-slate"
                        onClick={() => handleSelectSuggestion(college)}
                      >
                        {college}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                type="submit" 
                className="btn-primary w-full py-3 text-lg"
                disabled={!guess.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Submit Guess
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.button 
                onClick={resetGame}
                className="btn-primary w-full py-3 text-lg mb-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Play Again
              </motion.button>
              
              <motion.button 
                onClick={changeGameMode}
                className="btn-secondary w-full py-3 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Change Game Mode
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 