import axios from 'axios'

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : ''

const adminApi = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api',
  withCredentials: true,
})

/** Check if the current user has an admin session (cookie). Returns session or null. */
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

/** Build the backend sign-in URL; after OAuth user is redirected to callbackUrl. */
export function getSignInUrl(callbackUrl: string): string {
  const base = API_BASE ? `${API_BASE.replace(/\/$/, '')}/auth` : '/auth'
  const url = `${base}/signin`
  const params = new URLSearchParams({ callbackUrl: callbackUrl })
  return `${url}?${params.toString()}`
}
