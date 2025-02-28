"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"
import type { Difficulty, GameState, GameAction, Player } from "@/app/types/game"
import { GAME_CONFIG } from "@/app/config/constants"

const initialState: GameState = {
  selectedDifficulty: null,
  currentPlayer: null,
  attempts: [],
  gameStatus: 'idle',
  hintsRevealed: 0,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_DIFFICULTY':
      return {
        ...initialState,
        selectedDifficulty: action.payload,
      }
    case 'START_GAME':
      return {
        ...state,
        currentPlayer: action.payload,
        gameStatus: 'playing',
        attempts: [],
        hintsRevealed: 0,
      }
    case 'MAKE_GUESS': {
      const isCorrect = state.currentPlayer?.college.toLowerCase() === action.payload.toLowerCase()
      const maxAttempts = state.selectedDifficulty 
        ? GAME_CONFIG.difficulties[state.selectedDifficulty].maxAttempts 
        : 3
      
      const newAttempts = [...state.attempts, action.payload]
      const isOutOfAttempts = newAttempts.length >= maxAttempts
      
      return {
        ...state,
        attempts: newAttempts,
        gameStatus: isCorrect ? 'won' : (isOutOfAttempts ? 'lost' : state.gameStatus),
      }
    }
    case 'REVEAL_HINT':
      return {
        ...state,
        hintsRevealed: state.hintsRevealed + 1,
      }
    case 'RESET_GAME':
      return initialState
    default:
      return state
  }
}

interface GameContextType extends GameState {
  selectDifficulty: (difficulty: Difficulty) => void
  startGame: (player: Player) => void
  makeGuess: (guess: string) => void
  revealHint: () => void
  resetGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const selectDifficulty = (difficulty: Difficulty) => {
    dispatch({ type: 'SELECT_DIFFICULTY', payload: difficulty })
  }

  const startGame = (player: Player) => {
    dispatch({ type: 'START_GAME', payload: player })
  }

  const makeGuess = (guess: string) => {
    dispatch({ type: 'MAKE_GUESS', payload: guess })
  }

  const revealHint = () => {
    dispatch({ type: 'REVEAL_HINT' })
  }

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <GameContext.Provider
      value={{
        ...state,
        selectDifficulty,
        startGame,
        makeGuess,
        revealHint,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
} 