// src/hooks/useGame.ts
"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty, GameState, Player } from '@/app/types/game'
import { GAME_CONFIG } from '@/app/config/constants'

interface GameStore extends GameState {
  selectDifficulty: (difficulty: Difficulty) => void
  makeGuess: (guess: string) => void
  resetGame: () => void
  startGame: (player: Player) => void
  revealHint: () => void
}

export const useGame = create<GameStore>()(
  persist(
    (set) => ({
      selectedDifficulty: null,
      attempts: [],
      currentPlayer: null,
      gameStatus: 'idle',
      hintsRevealed: 0,

      selectDifficulty: (difficulty) => 
        set({ 
          selectedDifficulty: difficulty, 
          attempts: [], 
          gameStatus: 'idle',
          hintsRevealed: 0,
          currentPlayer: null
        }),

      startGame: (player) =>
        set({ 
          currentPlayer: player,
          gameStatus: 'playing',
          hintsRevealed: 0,
          attempts: []
        }),

      makeGuess: (guess) =>
        set((state) => {
          const attempts = [...state.attempts, guess]
          const maxAttempts = state.selectedDifficulty ? 
            GAME_CONFIG.difficulties[state.selectedDifficulty].maxAttempts : 
            GAME_CONFIG.MAX_ATTEMPTS
          
          const isCorrect = state.currentPlayer && 
            guess.toLowerCase() === state.currentPlayer.college.toLowerCase()
          
          let gameStatus = state.gameStatus
          
          if (isCorrect) {
            gameStatus = 'won'
          } else if (attempts.length >= maxAttempts) {
            gameStatus = 'lost'
          }
          
          return {
            attempts,
            gameStatus
          }
        }),

      revealHint: () =>
        set((state) => ({
          hintsRevealed: Math.min(
            state.hintsRevealed + 1,
            state.selectedDifficulty ? 
              GAME_CONFIG.difficulties[state.selectedDifficulty].hintCount : 
              3
          )
        })),

      resetGame: () =>
        set({ 
          selectedDifficulty: null, 
          attempts: [], 
          gameStatus: 'idle',
          hintsRevealed: 0,
          currentPlayer: null
        }),
    }),
    {
      name: GAME_CONFIG.STORAGE_KEYS.GAME_STATE,
    }
  )
)