import axios from 'axios'

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : ''

const ADMIN_TOKEN_KEY = 'adminToken'

function getStoredToken(): string {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAdminToken(token: string) {
  try {
    if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
    else sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function clearAdminToken() {
  setAdminToken('')
}

const adminApi = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api',
  withCredentials: true,
})

adminApi.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers['X-Admin-Token'] = token
  return config
})

/** Check if the current user has an admin session (cookie or valid token). Returns session or null. */
export async function getAdminSession(): Promise<{ user?: { name?: string; email?: string; image?: string } } | null> {
  try {
    const { data } = await adminApi.get<{ user?: { name?: string; email?: string; image?: string } }>('/admin/session')
    return data?.user ? data : null
  } catch {
    return null
  }
}

export async function adminGetWords(mode?: string) {
  const { data } = await adminApi.get('/admin/words', { params: mode ? { mode } : {} })
  return data
}

export async function adminAddWord(body: { mode: string; word: string; difficulty?: string; country?: string }) {
  const { data } = await adminApi.post('/admin/words', body)
  return data
}

export async function adminDeleteWord(id: string) {
  await adminApi.delete(`/admin/words/${id}`)
}

export async function adminGetUsage() {
  const { data } = await adminApi.get('/admin/usage')
  return data
}

export async function adminGetConfig() {
  const { data } = await adminApi.get('/admin/config')
  return data
}

export async function adminPatchConfig(body: { topUpRate?: number; enabledModes?: string[] }) {
  const { data } = await adminApi.patch('/admin/config', body)
  return data
}

export async function adminGetSessions(limit?: number) {
  const { data } = await adminApi.get('/admin/sessions', { params: limit ? { limit } : {} })
  return data
}

export async function adminGetAnalyticsModePopularity() {
  const { data } = await adminApi.get('/admin/analytics/mode-popularity')
  return data
}

export async function adminGetAnalyticsDifficultyDistribution() {
  const { data } = await adminApi.get('/admin/analytics/difficulty-distribution')
  return data
}

export async function adminGetAnalyticsSessionStats() {
  const { data } = await adminApi.get('/admin/analytics/session-stats')
  return data
}

export async function adminGetAnalyticsAiUsage() {
  const { data } = await adminApi.get('/admin/analytics/ai-usage')
  return data
}

export async function adminGetAnalyticsCustomWords() {
  const { data } = await adminApi.get('/admin/analytics/custom-words')
  return data
}

/** Build the backend sign-in URL; after OAuth user is redirected to callbackUrl. */
export function getSignInUrl(callbackUrl: string): string {
  const base = API_BASE ? `${API_BASE.replace(/\/$/, '')}/auth` : '/auth'
  const url = `${base}/signin`
  const params = new URLSearchParams({ callbackUrl: callbackUrl })
  return `${url}?${params.toString()}`
}

/** Sign out. Returns { ok, redirect? }. If redirect, navigate there for OAuth signout. */
export async function adminSignOut(): Promise<{ ok: boolean; redirect?: string }> {
  const { data } = await adminApi.post<{ ok: boolean; redirect?: string }>('/admin/signout')
  return data
}
