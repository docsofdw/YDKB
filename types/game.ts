import type { Difficulty } from "@/config/constants"

export interface GameState {
  selectedDifficulty: Difficulty | null
  attempts: string[]
  maxAttempts: number
  timeLimit: number
  isGameOver: boolean
  isGameWon: boolean
}

export interface GameSettings {
  difficulty: Difficulty
  maxAttempts: number
  timeLimit: number
}

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  totalTime: number
  averageTime: number
  winRate: number
} 