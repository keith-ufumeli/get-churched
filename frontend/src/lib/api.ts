import axios from 'axios'
import type { CardMode, CardResponse, Session } from '@/types/game'

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : ''

const api = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api'
})

export interface GenerateCardOptions {
  mode: CardMode
  difficulty?: string
  country?: string
  usedPrompts?: string[]
  sessionId?: string | null
}

export interface GenerateCardResponse {
  card: CardResponse
  source: 'ai' | 'builtin' | 'custom'
}

export async function generateCard(options: GenerateCardOptions): Promise<GenerateCardResponse> {
  const { data } = await api.post<GenerateCardResponse>('/cards/generate', {
    mode: options.mode,
    difficulty: options.difficulty ?? undefined,
    country: options.country ?? undefined,
    usedPrompts: options.usedPrompts ?? undefined,
    sessionId: options.sessionId ?? undefined,
  })
  return data
}

export async function saveSession(
  session: Session
): Promise<{ sessionId: string }> {
  const { data } = await api.post<{ sessionId: string }>('/sessions', session)
  return data
}

export async function fetchLeaderboard(limit = 10) {
  const { data } = await api.get('/leaderboard', {
    params: { limit, sort: 'score' },
  })
  return data
}

export async function getSession(id: string) {
  const { data } = await api.get(`/sessions/${id}`)
  return data
}

export async function saveLeaderboardEntry(entryData: { displayName: string; teamName?: string; score: number; sessionId: string }) {
  const { data } = await api.post('/leaderboard', entryData)
  return data
}
