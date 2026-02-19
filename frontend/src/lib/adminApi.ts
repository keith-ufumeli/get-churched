import axios from 'axios'

const ADMIN_TOKEN =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_TOKEN
    ? String(import.meta.env.VITE_ADMIN_TOKEN)
    : ''

function getToken(): string {
  if (ADMIN_TOKEN) return ADMIN_TOKEN
  try {
    return sessionStorage.getItem('adminToken') || ''
  } catch {
    return ''
  }
}

export function setAdminToken(token: string) {
  try {
    sessionStorage.setItem('adminToken', token)
  } catch {
    /* ignore */
  }
}

const adminApi = axios.create({ baseURL: '/api' })

adminApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers['X-Admin-Token'] = token
  return config
})

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
