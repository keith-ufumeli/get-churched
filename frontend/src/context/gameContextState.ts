import { createContext, useContext } from 'react'
import type { GameState, GameAction } from '@/types/game'

export const initialState: GameState = {
  sessionId: null,
  teams: [],
  rounds: [],
  currentTeamIndex: 0,
  roundsPerTeam: 5,
  status: 'idle',
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, ...action.payload, status: 'playing' }
    case 'SCORE_ROUND':
      return {
        ...state,
        rounds: [...state.rounds, action.payload],
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
      }
    case 'END_GAME':
      return { ...state, status: 'finished' }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
