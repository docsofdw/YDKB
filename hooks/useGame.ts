import { create } from "zustand"
import type { Difficulty } from "@/config/constants"
import type { GameState } from "@/types/game"

interface GameStore extends GameState {
  selectDifficulty: (difficulty: Difficulty) => void
  addAttempt: (attempt: string) => void
  resetGame: () => void
  setGameOver: (isWon: boolean) => void
}

const initialState: GameState = {
  selectedDifficulty: null,
  attempts: [],
  maxAttempts: 3,
  timeLimit: 300,
  isGameOver: false,
  isGameWon: false,
}

export const useGame = create<GameStore>((set) => ({
  ...initialState,
  selectDifficulty: (difficulty) => 
    set((state) => ({
      ...state,
      selectedDifficulty: difficulty,
      attempts: [],
      isGameOver: false,
      isGameWon: false,
    })),
  addAttempt: (attempt) =>
    set((state) => ({
      ...state,
      attempts: [...state.attempts, attempt],
    })),
  resetGame: () => set(initialState),
  setGameOver: (isWon) =>
    set((state) => ({
      ...state,
      isGameOver: true,
      isGameWon: isWon,
    })),
})) 