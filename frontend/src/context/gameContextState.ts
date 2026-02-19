import { createContext, useContext } from 'react'
import type { GameState, GameAction, ScoreRoundPayload } from '@/types/game'

export const initialState: GameState = {
  sessionId: null,
  teams: [],
  rounds: [],
  currentTeamIndex: 0,
  roundsPerTeam: 5,
  status: 'idle',
  gamePhase: 'SETUP',
  difficulty: 'medium',
  hymnCountry: '',
  selectedMode: null,
  totalRoundsForMode: 0,
  currentRoundIndexInSet: 0,
  usedCards: [],
}

function getTotalRounds(state: GameState): number {
  return state.teams.length * state.roundsPerTeam
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const payload = action.payload as Partial<GameState>
      return {
        ...state,
        ...payload,
        status: 'playing',
        gamePhase: 'MODE_SELECTED',
        usedCards: [],
        selectedMode: null,
        totalRoundsForMode: 0,
        currentRoundIndexInSet: 0,
      }
    }
    case 'START_ROUND_SET': {
      return {
        ...state,
        gamePhase: 'SHOW_RULES',
        selectedMode: action.payload.selectedMode,
        totalRoundsForMode: action.payload.roundsPerMode,
        currentRoundIndexInSet: 0,
      }
    }
    case 'DISMISS_RULES': {
      if (state.gamePhase !== 'SHOW_RULES') return state
      return { ...state, gamePhase: 'ROUND_ACTIVE' }
    }
    case 'SCORE_ROUND': {
      const payload = action.payload as ScoreRoundPayload
      const { usedCardKey, ...round } = payload
      const updatedTeams = state.teams.map((team) =>
        team.name === round.teamName
          ? { ...team, score: (team.score || 0) + (round.pointsEarned || 0) }
          : team
      )
      const nextIndexInSet = state.currentRoundIndexInSet + 1
      return {
        ...state,
        teams: updatedTeams,
        rounds: [...state.rounds, round],
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
        currentRoundIndexInSet: nextIndexInSet,
        gamePhase: 'ROUND_RESULT',
        usedCards: usedCardKey ? [...state.usedCards, usedCardKey] : state.usedCards,
      }
    }
    case 'NEXT_ROUND': {
      if (state.gamePhase !== 'ROUND_RESULT') return state
      const totalRounds = getTotalRounds(state)
      const gameComplete = state.rounds.length >= totalRounds
      const setComplete = state.totalRoundsForMode > 0 && state.currentRoundIndexInSet >= state.totalRoundsForMode

      if (gameComplete) {
        return { ...state, status: 'finished', gamePhase: 'GAME_COMPLETE' }
      }
      if (setComplete) {
        return { ...state, gamePhase: 'MODE_COMPLETE' }
      }
      return { ...state, gamePhase: 'ROUND_ACTIVE' }
    }
    case 'CLEAR_MODE_COMPLETE': {
      if (state.gamePhase !== 'MODE_COMPLETE') return state
      return {
        ...state,
        gamePhase: 'MODE_SELECTED',
        selectedMode: null,
        totalRoundsForMode: 0,
        currentRoundIndexInSet: 0,
      }
    }
    case 'END_GAME':
      return { ...state, status: 'finished', gamePhase: 'GAME_COMPLETE' }
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
