export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Player {
  id: string
  name: string
  position: string
  college: string
  draftYear: number
  team: string
  imageUrl?: string
  bio?: string
  collegeBio?: string
  difficulty?: string
  stats?: Record<string, string | number>
}

export interface GameState {
  selectedDifficulty: Difficulty | null
  currentPlayer: Player | null
  attempts: string[]
  gameStatus: 'idle' | 'playing' | 'won' | 'lost'
  hintsRevealed: number
}

export type GameAction = 
  | { type: 'SELECT_DIFFICULTY'; payload: Difficulty }
  | { type: 'START_GAME'; payload: Player }
  | { type: 'MAKE_GUESS'; payload: string }
  | { type: 'REVEAL_HINT' }
  | { type: 'RESET_GAME' }