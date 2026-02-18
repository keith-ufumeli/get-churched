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
}

export type GameStatus = 'idle' | 'setup' | 'playing' | 'finished'

export interface GameState {
  sessionId: string | null
  teams: Team[]
  rounds: Round[]
  currentTeamIndex: number
  roundsPerTeam: number
  status: GameStatus
}

export type GameAction =
  | { type: 'START_GAME'; payload: Partial<GameState> }
  | { type: 'SCORE_ROUND'; payload: Round }
  | { type: 'END_GAME' }
  | { type: 'RESET' }

export interface LeaderboardEntry {
  displayName: string
  teamName?: string
  score: number
  sessionId?: string
  achievedAt?: string
}
