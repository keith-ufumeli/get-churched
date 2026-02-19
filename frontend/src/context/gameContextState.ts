import { createContext, useContext } from 'react'
import type { GameState, GameAction, ScoreRoundPayload } from '@/types/game'

export const initialState: GameState = {
  sessionId: null,
  teams: [],
  rounds: [],
  currentTeamIndex: 0,
  roundsPerTeam: 5,
  status: 'idle',
  difficulty: 'medium',
  hymnCountry: '',
  selectedMode: null,
  roundsPerMode: 0,
  roundsPlayedInSet: 0,
  usedCards: [],
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const payload = action.payload as Partial<GameState>
      return {
        ...state,
        ...payload,
        status: 'playing',
        usedCards: [],
        roundsPlayedInSet: 0,
        selectedMode: null,
        roundsPerMode: 0,
      }
    }
    case 'START_ROUND_SET': {
      return {
        ...state,
        selectedMode: action.payload.selectedMode,
        roundsPerMode: action.payload.roundsPerMode,
        roundsPlayedInSet: 0,
      }
    }
    case 'SCORE_ROUND': {
      const payload = action.payload as ScoreRoundPayload
      const { usedCardKey, ...round } = payload
      const updatedTeams = state.teams.map((team) =>
        team.name === round.teamName
          ? { ...team, score: (team.score || 0) + (round.pointsEarned || 0) }
          : team
      )
      const nextPlayedInSet = state.roundsPlayedInSet + 1
      const setComplete = state.roundsPerMode > 0 && nextPlayedInSet >= state.roundsPerMode
      return {
        ...state,
        teams: updatedTeams,
        rounds: [...state.rounds, round],
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
        roundsPlayedInSet: setComplete ? 0 : nextPlayedInSet,
        selectedMode: setComplete ? null : state.selectedMode,
        roundsPerMode: setComplete ? 0 : state.roundsPerMode,
        usedCards: usedCardKey ? [...state.usedCards, usedCardKey] : state.usedCards,
      }
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
