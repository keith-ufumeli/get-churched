import axios from 'axios'
import type { CardMode, CardResponse, Session } from '@/types/game'

const api = axios.create({ baseURL: '/api' })

export async function generateCard(mode: CardMode): Promise<CardResponse> {
  const { data } = await api.post<CardResponse>('/cards/generate', { mode })
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
