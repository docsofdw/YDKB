// src/components/features/game/GameContainer.tsx
"use client"

import { useState, useEffect } from "react"
import { DifficultySelector } from "./DifficultySelector"
import { GuessInput } from "./GuessInput"
import { AttemptsDisplay } from "./AttemptsDisplay"
import { useGame } from "@/hooks/useGame"
import QuestionCard from "@/components/QuestionCard"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Difficulty } from "@/types/game"

// Define types for the player data
// This should match the interface in QuestionCard.tsx
interface PlayerOption {
  id: number;
  name: string;
  team: string;
  position: string;
  jersey_number: string;
  ppg: number;
  college: string;
  height?: string;
  weight?: string;
  experience?: string;
}

interface PlayerData {
  question: string;
  options: PlayerOption[];
  correctOption: number;
  player: any; // Using any for now, ideally this would be a more specific type
}

export function GameContainer() {
  const { selectedDifficulty, attempts, makeGuess, setCurrentPlayer } = useGame()
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDifficulty) {
      fetchPlayerData(selectedDifficulty)
    }
  }, [selectedDifficulty])

  const fetchPlayerData = async (difficulty: Difficulty) => {
    try {
      setLoading(true)
      setError(null)
      
      // Create Supabase client
      const supabase = createClientComponentClient()
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]
      
      // First, get the daily challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .single()
      
      if (challengeError) {
        throw new Error(`Error fetching daily challenge: ${challengeError.message}`)
      }
      
      if (!challengeData) {
        throw new Error('No challenge found for today')
      }
      
      // Get player IDs based on difficulty
      let playerId
      if (difficulty === 'easy') {
        playerId = challengeData.easy_player_id
      } else if (difficulty === 'hard') {
        playerId = challengeData.hard_player_id
      } else if (difficulty === 'hof') {
        playerId = challengeData.hof_player_id
      }
      
      if (!playerId) {
        throw new Error(`No player found for difficulty: ${difficulty}`)
      }
      
      // Then, get the player data
      const { data: playerInfo, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()
      
      if (playerError) {
        throw new Error(`Error fetching player: ${playerError.message}`)
      }
      
      // Set the current player in the game state
      setCurrentPlayer(playerInfo)
      
      // Get some options for the question (including the correct answer)
      const { data: options, error: optionsError } = await supabase
        .from('players')
        .select('id, name, college, team, position, jersey_number, ppg, height, weight, experience')
        .limit(4)
      
      if (optionsError) {
        throw new Error(`Error fetching options: ${optionsError.message}`)
      }
      
      // Make sure the correct player is in the options
      let formattedOptions = options || []
      const correctOptionIndex = formattedOptions.findIndex(p => p.id === playerId)
      
      // If the correct player is not in the options, replace one option with the correct player
      if (correctOptionIndex === -1 && playerInfo) {
        formattedOptions[0] = {
          id: playerInfo.id,
          name: playerInfo.name,
          college: playerInfo.college,
          team: playerInfo.team || '',
          position: playerInfo.position || '',
          jersey_number: playerInfo.jersey_number || '',
          ppg: playerInfo.ppg || 0,
          height: playerInfo.height,
          weight: playerInfo.weight,
          experience: playerInfo.experience
        }
      }
      
      // Shuffle the options
      formattedOptions = shuffleArray(formattedOptions)
      
      // Find the index of the correct option after shuffling
      const correctIndex = formattedOptions.findIndex(p => p.id === playerId)
      
      // Format the data to match what the component expects
      const formattedData: PlayerData = {
        question: "Which college did this player attend?",
        options: formattedOptions,
        correctOption: correctIndex,
        player: playerInfo
      }
      
      setPlayerData(formattedData)
      
    } catch (err) {
      console.error('Error fetching player data:', err)
      setError(
        err && typeof err === 'object' && 'message' in err 
          ? err.message as string 
          : 'Failed to load player data'
      )
    } finally {
      setLoading(false)
    }
  }

  // Helper function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const handleGuess = (guess: string) => {
    makeGuess(guess)
    
    if (attempts.length >= 2) {
      setShowAnswer(true)
    }
  }

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index)
    
    if (playerData && index === playerData.correctOption) {
      setShowAnswer(true)
      makeGuess(playerData.options[index].college)
    } else if (playerData && playerData.options[index]) {
      handleGuess(playerData.options[index].college || "Unknown")
    }
  }

  if (!selectedDifficulty) {
    return <DifficultySelector />
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-lg p-8 text-center">
        <p className="text-white text-lg">Error: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => selectedDifficulty && fetchPlayerData(selectedDifficulty)}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-lg p-8 text-center">
        <p className="text-white text-lg">Loading player data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {playerData ? (
        <QuestionCard 
          question={playerData.question}
          options={playerData.options}
          onSelect={handleOptionSelect}
          selectedOption={selectedOption}
          correctOption={playerData.correctOption}
          showAnswer={showAnswer}
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-lg p-8 text-center">
          <p className="text-white text-lg">No player data available</p>
        </div>
      )}
      
      {!showAnswer && (
        <GuessInput
          onGuess={handleGuess}
          disabled={attempts.length >= 3 || showAnswer}
        />
      )}
      
      <AttemptsDisplay attempts={attempts} />
    </div>
  )
}