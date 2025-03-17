'use client';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getPlayerImage } from '../../../lib/playerImages'; // Import the new function

// Define types for better TypeScript support
interface Player {
  id: number;
  name: string;
  position: string;
  college: string;
  difficulty: string;
  image_url?: string;
}

export function GameContainer() {
  // Game state
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'incorrect' | 'gaveup'>('playing');
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Maximum attempts allowed
  const MAX_ATTEMPTS = 3;

  // Use a mock player if Supabase connection fails
  const mockPlayer: Player = {
    id: 1,
    name: 'Randall Cunningham',
    position: 'QB',
    college: 'UNLV',
    difficulty: 'Easy',
    image_url: undefined
  };

  useEffect(() => {
    setIsLoaded(true);
    setIsClient(true);
    
    // Initialize domQueryService if needed
    if (typeof window !== 'undefined') {
      // Define window.domQueryService directly
      window.domQueryService = window.domQueryService || {
        checkPageContainsShadowDom: () => false,
        getDocument: () => document,
        querySelector: (selector: string) => document.querySelector(selector),
        querySelectorAll: (selector: string) => document.querySelectorAll(selector)
      };
      
      // Fix for bootstrap-legacy-aut-overlay.js
      if (typeof window.checkPageContainsShadowDom === 'undefined') {
        window.checkPageContainsShadowDom = () => false;
      }
    }
    
    // Fetch player data with a timeout to prevent hanging
    const fetchTimeout = setTimeout(() => {
      if (loading) {
        console.log('Fetch player timeout - using mock data');
        setPlayer(mockPlayer);
        setPlayerCount(1);
        setLoading(false);
      }
    }, 5000);
    
    fetchPlayer().catch(err => {
      console.error('Error in fetchPlayer:', err);
      setPlayer(mockPlayer);
      setPlayerCount(1);
      setLoading(false);
    });
    
    return () => clearTimeout(fetchTimeout);
  }, []);

  // Handle browser extensions that might interfere with the component
  useEffect(() => {
    if (containerRef.current) {
      // Create a MutationObserver to detect and handle injected elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              // Check if the added node is a script or other element that might cause issues
              if (node.nodeName === 'SCRIPT' || 
                  (node.nodeType === 1 && (node as Element).hasAttribute('data-is-priority'))) {
                // Remove the node to prevent hydration errors
                node.parentNode?.removeChild(node);
              }
            });
          }
        });
      });
      
      // Start observing the container with the configured parameters
      observer.observe(containerRef.current, { childList: true, subtree: true });
      
      // Clean up the observer when the component unmounts
      return () => {
        observer.disconnect();
      };
    }
  }, [isClient]);

  // Add a new useEffect to fetch the player image when a player is selected
  useEffect(() => {
    async function fetchPlayerImage() {
      if (player?.name && isClient) {
        try {
          // First check if we already have the image URL in the database
          if (player.image_url) {
            setPlayerImage(player.image_url);
          } else {
            // If not, fetch it from the API
            const imageUrl = await getPlayerImage(player.name);
            setPlayerImage(imageUrl);
            
            // Cache the URL in the database if we found an image
            if (imageUrl) {
              try {
                const supabase = createBrowserClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                await supabase
                  .from('players')
                  .update({ image_url: imageUrl })
                  .eq('id', player.id);
              } catch (err) {
                console.error('Error updating player image URL:', err);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching player image:', error);
          // Don't set error state to avoid breaking the game
        }
      } else {
        setPlayerImage(null);
      }
    }
    
    fetchPlayerImage();
  }, [player?.name, isClient]);

  // Fetch a player from Supabase
  const fetchPlayer = async () => {
    if (!isClient) return;
    
    try {
      setLoading(true);
      
      // Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Get a random player (using Easy difficulty for simplicity)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('difficulty', 'Easy')
        .limit(10);
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Get total count of players
      const { count, error: countError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }
      
      setPlayerCount(count || 0);
      
      // If we have players, select one randomly
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setPlayer(data[randomIndex]);
      } else {
        // Use mock data if no players are returned
        console.log('No players found, using mock data');
        setPlayer(mockPlayer);
        setPlayerCount(1);
      }
    } catch (err: any) {
      console.error('Error fetching player:', err);
      setError(err.message);
      // Use mock data on error
      setPlayer(mockPlayer);
      setPlayerCount(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle guess submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player || gameState !== 'playing') return;
    
    const trimmedGuess = guess.trim();
    if (!trimmedGuess) return;
    
    // Add to guesses array if not already included
    if (!guesses.includes(trimmedGuess)) {
      const updatedGuesses = [...guesses, trimmedGuess];
      setGuesses(updatedGuesses);
      
      // Check if guess is correct (case insensitive)
      const isCorrect = trimmedGuess.toLowerCase() === player.college.toLowerCase();
      const newAttempts = attempts + 1;
      
      if (isCorrect) {
        setFeedback('Correct! Well done!');
        setGameState('correct');
        
        // Load a new question after a delay
        setTimeout(() => {
          resetGame();
        }, 2000);
      } else {
        if (newAttempts >= MAX_ATTEMPTS) {
          setFeedback(`Game over! The correct answer was ${player.college}`);
          setGameState('incorrect');
        } else {
          setFeedback(`Incorrect. Try again! (Attempt ${newAttempts}/${MAX_ATTEMPTS})`);
        }
        setAttempts(newAttempts);
      }
    } else {
      setFeedback('You already guessed that college.');
    }
    
    // Clear the input
    setGuess('');
  };

  // Handle giving up
  const handleGiveUp = () => {
    if (player && gameState === 'playing') {
      setFeedback(`You gave up. The correct answer was ${player.college}.`);
      setGameState('gaveup');
    }
  };

  // Reset the game
  const resetGame = () => {
    setGuess('');
    setAttempts(0);
    setGuesses([]);
    setFeedback('');
    setGameState('playing');
    setPlayerImage(null);
    fetchPlayer().catch(err => {
      console.error('Error resetting game:', err);
      setPlayer(mockPlayer);
    });
  };

  // Show loading state during initial load
  if (!isLoaded || !isClient) {
    return <div className="bg-gray-800 text-white p-8 rounded-lg">Loading game data...</div>;
  }

  if (loading) {
    return <div className="bg-gray-800 text-white p-8 rounded-lg">Loading player data...</div>;
  }
  
  if (error && !player) {
    return (
      <div className="bg-red-800 text-white p-8 rounded-lg">
        <p>Error: {error}</p>
        <button 
          onClick={() => {
            setError(null);
            setPlayer(mockPlayer);
          }}
          className="mt-4 bg-white text-red-800 px-4 py-2 rounded"
        >
          Use Demo Player
        </button>
      </div>
    );
  }
  
  if (!player) {
    return (
      <div className="bg-red-800 text-white p-8 rounded-lg">
        <p>No players available</p>
        <button 
          onClick={() => setPlayer(mockPlayer)}
          className="mt-4 bg-white text-red-800 px-4 py-2 rounded"
        >
          Use Demo Player
        </button>
      </div>
    );
  }

  const isGameOver = gameState === 'correct' || gameState === 'incorrect' || gameState === 'gaveup';

  return (
    <div className="bg-gray-800 text-white p-8 rounded-lg" ref={containerRef}>
      <h2 className="text-xl font-bold mb-6">Who is this NFL player?</h2>
      
      {/* Display player image or clue */}
      <div className="mb-6 h-64 bg-gray-700 flex items-center justify-center rounded-lg">
        {playerImage ? (
          <img 
            src={playerImage} 
            alt={player?.name || 'NFL Player'} 
            className="max-h-full max-w-full object-contain rounded"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-gray-600 rounded-full w-32 h-32 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-300">
                {player?.name?.charAt(0) || '?'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Player info */}
      <div className="mb-4">
        <p className="font-semibold">{player?.name || 'Unknown Player'}</p>
        <p className="text-gray-400">Position: {player?.position || 'Unknown'}</p>
        <p className="text-gray-400">Difficulty: {player?.difficulty || 'Unknown'}</p>
      </div>
      
      {/* Previous guesses */}
      {guesses.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Previous guesses:</p>
          <div className="flex flex-wrap gap-2">
            {guesses.map((g, index) => (
              <span key={index} className="bg-gray-700 px-2 py-1 rounded text-sm">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Game feedback */}
      {feedback && (
        <div className={`mb-4 p-3 rounded ${
          gameState === 'correct' 
            ? 'bg-green-700' 
            : gameState === 'incorrect' || gameState === 'gaveup'
              ? 'bg-yellow-700'
              : 'bg-red-700'
        }`}>
          {feedback}
        </div>
      )}
      
      {/* Attempt indicators */}
      <div className="flex mb-4 gap-2">
        {[...Array(MAX_ATTEMPTS)].map((_, i) => (
          <div 
            key={i} 
            className={`w-8 h-8 flex items-center justify-center rounded-full border ${
              i < attempts 
                ? 'border-red-500 bg-red-500 bg-opacity-20' 
                : 'border-gray-600'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Guess form */}
      {!isGameOver ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex relative">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter college name..."
              className="flex-grow px-4 py-2 rounded-l text-black"
              autoComplete="off"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-r"
            >
              Guess
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleGiveUp}
            className="mt-2 text-sm text-gray-400 hover:text-white"
          >
            I Don't Know Ball
          </button>
        </form>
      ) : (
        // Only show Play Again button if the game is over due to wrong answers or giving up
        // Don't show it when the answer is correct (since we auto-advance)
        gameState === 'correct' ? null : (
          <button 
            onClick={resetGame}
            className="w-full bg-green-600 hover:bg-green-700 px-6 py-2 rounded mb-4"
          >
            Play Again
          </button>
        )
      )}
      
      {/* Player college info (shown after game is over) */}
      {isGameOver && (
        <div className="mt-4 bg-gray-700 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">College: {player.college}</h3>
          <p className="text-sm text-gray-300">
            {player.name} played college football at {player.college}.
          </p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-400">
        Players in database: {playerCount}
      </div>
    </div>
  );
}

export default GameContainer; 