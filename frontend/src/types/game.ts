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

export interface Round {
  teamName: string
  mode: CardMode
  card: string | TriviaCard | FillInBlankCard | TabooCard
  pointsEarned?: number
  timestamp?: string
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

export interface GameState {
  sessionId: string | null
  teams: Team[]
  rounds: Round[]
  currentTeamIndex: number
  roundsPerTeam: number
  status: GameStatus
  difficulty: Difficulty
  hymnCountry: string
  selectedMode: CardMode | null
  roundsPerMode: number
  roundsPlayedInSet: number
  usedCards: string[]
}

export type ScoreRoundPayload = Round & { usedCardKey?: string }

export type GameAction =
  | { type: 'START_GAME'; payload: Partial<GameState> }
  | { type: 'START_ROUND_SET'; payload: { selectedMode: CardMode; roundsPerMode: number } }
  | { type: 'SCORE_ROUND'; payload: ScoreRoundPayload }
  | { type: 'END_GAME' }
  | { type: 'RESET' }

export interface LeaderboardEntry {
  displayName: string
  teamName?: string
  score: number
  sessionId?: string
  achievedAt?: string
}
