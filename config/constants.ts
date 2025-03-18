export const GAME_CONFIG = {
  DIFFICULTY_LABELS: {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  },
  DIFFICULTY_SETTINGS: {
    easy: {
      timeLimit: 300, // 5 minutes
      maxAttempts: 5,
    },
    medium: {
      timeLimit: 180, // 3 minutes
      maxAttempts: 3,
    },
    hard: {
      timeLimit: 60, // 1 minute
      maxAttempts: 2,
    },
  },
} as const

export type Difficulty = keyof typeof GAME_CONFIG.DIFFICULTY_LABELS 