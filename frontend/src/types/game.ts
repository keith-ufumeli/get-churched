export type CardMode =
  | 'sing'
  | 'act'
  | 'explain'
  | 'trivia'
  | 'hum'
  | 'whoami'
  | 'fillinblank'
  | 'taboo'
  | 'oneword'
  | 'draw'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'

export interface Team {
  name: string
  color?: string
  score?: number
}

export type CardSource = 'ai' | 'builtin' | 'custom'

export interface Round {
  teamName: string
  mode: CardMode
  card: string | TriviaCard | FillInBlankCard | TabooCard
  pointsEarned?: number
  timestamp?: string
  cardSource?: CardSource | null
  roundDurationMs?: number
  skipped?: boolean
}

export interface TriviaCard {
  q: string
  a: string
  options: string[]
}

export interface FillInBlankCard {
  verse: string
  answer: string
  ref: string
}

export interface TabooCard {
  word: string
  forbidden: string[]
}

export type CardResponse =
  | string
  | TriviaCard
  | FillInBlankCard
  | TabooCard

export interface Session {
  sessionId: string
  playedAt?: string
  teams: Team[]
  rounds: Round[]
  winner?: string
  totalRounds?: number
  selectedMode?: string | null
  roundsPerMode?: number | null
  difficulty?: string | null
}

export type GameStatus = 'idle' | 'setup' | 'playing' | 'finished'

export type GamePhase =
  | 'SETUP'
  | 'MODE_SELECTED'
  | 'SHOW_RULES'
  | 'ROUND_ACTIVE'
  | 'ROUND_RESULT'
  | 'MODE_COMPLETE'
  | 'GAME_COMPLETE'

export interface GameState {
  sessionId: string | null
  teams: Team[]
  rounds: Round[]
  currentTeamIndex: number
  roundsPerTeam: number
  status: GameStatus
  gamePhase: GamePhase
  difficulty: Difficulty
  hymnCountry: string
  selectedMode: CardMode | null
  /** Total rounds for the current mode set (locked until set complete). */
  totalRoundsForMode: number
  /** 0-based index of rounds completed in current set. */
  currentRoundIndexInSet: number
  usedCards: string[]
}

export type ScoreRoundPayload = Round & { usedCardKey?: string }

export type GameAction =
  | { type: 'START_GAME'; payload: Partial<GameState> }
  | { type: 'START_ROUND_SET'; payload: { selectedMode: CardMode; roundsPerMode: number } }
  | { type: 'DISMISS_RULES' }
  | { type: 'SCORE_ROUND'; payload: ScoreRoundPayload }
  | { type: 'NEXT_ROUND' }
  | { type: 'CLEAR_MODE_COMPLETE' }
  | { type: 'END_GAME' }
  | { type: 'RESET' }

export interface LeaderboardEntry {
  displayName: string
  teamName?: string
  score: number
  sessionId?: string
  achievedAt?: string
}
