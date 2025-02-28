// src/components/features/game/GameContainer.tsx
"use client"

import { useState, useEffect } from "react"
import { DifficultySelector } from "./DifficultySelector"
import { AttemptsDisplay } from "./AttemptsDisplay"
import { useGame } from "@/app/hooks/useGame"
import QuestionCard from "@/app/components/QuestionCard"
import { GAME_CONFIG } from "@/app/config/constants"
import CollegeSearch from "./CollegeSearch"
import type { Player } from "@/app/types/game"

export function GameContainer() {
  const { 
    selectedDifficulty, 
    attempts, 
    makeGuess, 
    currentPlayer, 
    gameStatus, 
    hintsRevealed, 
    revealHint, 
    startGame 
  } = useGame()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<string[]>([])
  const [gameComplete, setGameComplete] = useState(false)

  // Get difficulty configuration
  const difficultyConfig = selectedDifficulty 
    ? GAME_CONFIG.difficulties[selectedDifficulty] 
    : null
  
  const maxAttempts = difficultyConfig?.maxAttempts ?? GAME_CONFIG.MAX_ATTEMPTS
  const maxHints = difficultyConfig?.hintCount ?? 3

  // Fetch player data when difficulty is selected
  useEffect(() => {
    if (selectedDifficulty && !currentPlayer) {
      fetchPlayerData(selectedDifficulty)
    }
  }, [selectedDifficulty, currentPlayer])

  /**
   * Fetches player data based on selected difficulty
   */
  const fetchPlayerData = async (difficulty: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate fetching player data
      // In a real app, this would come from an API or database
      const mockPlayer: Player = {
        id: "1",
        name: "Patrick Mahomes",
        position: "QB",
        college: "Texas Tech",
        draftYear: 2017,
        team: "Kansas City Chiefs",
        imageUrl: "/images/player-placeholder.svg"
      }
      
      startGame(mockPlayer)
    } catch (err: any) {
      console.error('Error fetching player data:', err)
      setError(err.message || 'Failed to load player data')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles user guess submission
   */
  const handleGuess = (guess: string) => {
    setGuesses(prev => [...prev, guess])
    
    // Check if the guess is correct
    const isCorrect = currentPlayer && 
      guess.toLowerCase() === currentPlayer.college.toLowerCase()
    
    if (isCorrect) {
      setGameComplete(true)
    }
    
    makeGuess(guess)
  }

  /**
   * Handles user giving up
   */
  const handleGiveUp = () => {
    setGameComplete(true)
  }

  // Render difficulty selector if no difficulty is selected
  if (!selectedDifficulty) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-md">
        <DifficultySelector />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-background rounded-lg border shadow-md animate-in fade-in">
        <h2 className="text-xl font-semibold mb-4 text-destructive">Error Occurred</h2>
        <p className="text-foreground mb-4">{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => fetchPlayerData(selectedDifficulty)}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Render loading state
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-background rounded-lg border shadow-md animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <p className="text-foreground text-lg mt-4">Loading player data...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 p-4">
      {/* Game Status Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {gameStatus === 'won' ? '🎉 You Won!' : 
           gameStatus === 'lost' ? '😔 Game Over' : 
           `Difficulty: ${difficultyConfig?.name || 'Custom'}`}
        </h1>
        {gameStatus === 'playing' && (
          <p className="text-muted-foreground">
            Guess the college of this NFL player
          </p>
        )}
      </div>
      
      {/* Player Question Card */}
      {currentPlayer ? (
        <div className="transition-all duration-300 ease-in-out">
          <QuestionCard 
            playerData={currentPlayer}
            hintsRevealed={hintsRevealed}
            onRevealHint={revealHint}
            maxHints={maxHints}
          />
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto p-6 bg-background rounded-lg border shadow-md">
          <p className="text-foreground text-lg">No player data available</p>
        </div>
      )}
      
      {/* College Search Input */}
      {gameStatus === 'playing' && (
        <div className="w-full max-w-md mx-auto transition-all duration-300 ease-in-out">
          <CollegeSearch
            onGuess={handleGuess}
            attempts={guesses.length}
            maxAttempts={maxAttempts}
            guesses={guesses}
            gameComplete={gameComplete}
            onGiveUp={handleGiveUp}
            disabled={gameStatus !== 'playing'}
          />
        </div>
      )}
      
      {/* Game Results Section */}
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <div className="w-full max-w-md mx-auto p-6 bg-background rounded-lg border shadow-md text-center animate-in fade-in">
          <h2 className="text-xl font-semibold mb-4">
            {gameStatus === 'won' ? 'Congratulations!' : 'Better luck next time!'}
          </h2>
          <p className="mb-4">
            {gameStatus === 'won' 
              ? `You guessed correctly in ${attempts.length} ${attempts.length === 1 ? 'attempt' : 'attempts'}!` 
              : `The correct answer was: ${currentPlayer?.college}`}
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      )}
      
      {/* Attempts Display */}
      <AttemptsDisplay 
        attempts={attempts} 
        maxAttempts={maxAttempts}
      />
    </div>
  )
}