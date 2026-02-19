import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getAdminSession,
  getSignInUrl,
  setAdminToken,
  adminGetWords,
  adminAddWord,
  adminDeleteWord,
  adminGetUsage,
  adminGetConfig,
  adminPatchConfig,
  adminGetSessions,
} from '@/lib/adminApi'
import { Lock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const ADMIN_PATH = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PATH
  ? String(import.meta.env.VITE_ADMIN_PATH)
  : 'admin-portal'

export function AdminPortalPage() {
  const queryClient = useQueryClient()
  const [tokenInput, setTokenInput] = useState('')
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'session'],
    queryFn: getAdminSession,
    retry: false,
  })
  const authenticated = Boolean(session?.user)

  const handleTokenSignIn = async () => {
    const token = tokenInput.trim()
    if (!token) {
      toast.error('Enter an admin token')
      return
    }
    setAdminToken(token)
    setTokenInput('')
    const result = await refetch()
    if (result.data?.user) {
      toast.success('Signed in with token')
    } else {
      setAdminToken('')
      toast.error('Invalid admin token')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment p-6 font-sans flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <p className="text-warmBrown">Checking session…</p>
        </Card>
      </div>
    )
  }

  if (!authenticated) {
    const callbackUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/${ADMIN_PATH.replace(/^\/+|\/+$/g, '')}`
      : ''
    const signInUrl = getSignInUrl(callbackUrl)
    return (
      <div className="min-h-screen bg-parchment p-6 font-sans flex items-center justify-center">
        <Card className="p-8 max-w-md w-full space-y-4">
          <div className="flex items-center gap-2 text-mahogany">
            <Lock className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin access</h1>
          </div>
          <p className="text-sm text-warmBrown">Sign in with GitHub or use an admin token.</p>
          <Button asChild className="w-full">
            <a href={signInUrl}>Sign in with GitHub</a>
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-warmBrown/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-warmBrown/70">
              <span className="bg-parchment px-2">or</span>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Admin token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTokenSignIn()}
            />
            <Button variant="outline" onClick={handleTokenSignIn} className="w-full">
              Sign in with token
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-mahogany mb-4">Admin portal</h1>
        <Tabs defaultValue="words" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="usage">AI usage</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="words">
            <WordsTab />
          </TabsContent>
          <TabsContent value="usage">
            <UsageTab />
          </TabsContent>
          <TabsContent value="config">
            <ConfigTab queryClient={queryClient} />
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function WordsTab() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState('')
  const [word, setWord] = useState('')
  const { data: words = [], refetch } = useQuery({
    queryKey: ['admin', 'words'],
    queryFn: () => adminGetWords(),
  })
  const addMutation = useMutation({
    mutationFn: adminAddWord,
    onSuccess: () => {
      toast.success('Word added')
      setWord('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'words'] })
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(e.response?.data?.error || 'Failed to add word')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: adminDeleteWord,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'words'] }),
  })

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <Input
          placeholder="Mode (e.g. sing)"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-28"
        />
        <Input
          placeholder="Word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="flex-1 min-w-[120px]"
        />
        <Button
          onClick={() => {
            if (!mode.trim() || !word.trim()) return
            addMutation.mutate({ mode: mode.trim(), word: word.trim() })
          }}
          disabled={addMutation.isPending}
        >
          Add
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Mode</th>
              <th className="p-2">Word</th>
              <th className="p-2">Difficulty</th>
              <th className="p-2">Country</th>
              <th className="p-2 w-20" />
            </tr>
          </thead>
          <tbody>
            {words.map((w: { _id: string; mode: string; word: string; difficulty?: string; country?: string }) => (
              <tr key={w._id} className="border-b">
                <td className="p-2">{w.mode}</td>
                <td className="p-2">{w.word}</td>
                <td className="p-2">{w.difficulty ?? '—'}</td>
                <td className="p-2">{w.country ?? '—'}</td>
                <td className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(w._id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
    </Card>
  )
}

function UsageTab() {
  const { data: usage = {}, refetch } = useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: adminGetUsage,
  })
  const entries = Object.entries(usage) as [string, { calls: number; tokens: number; failures: number }][]

  return (
    <Card className="p-4 space-y-4">
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Session</th>
              <th className="p-2">Calls</th>
              <th className="p-2">Tokens</th>
              <th className="p-2">Failures</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([sessionId, v]) => (
              <tr key={sessionId} className="border-b">
                <td className="p-2 font-mono text-xs truncate max-w-[200px]">{sessionId}</td>
                <td className="p-2">{v.calls}</td>
                <td className="p-2">{v.tokens}</td>
                <td className="p-2">{v.failures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 0 && <p className="text-warmBrown text-sm">No usage recorded yet.</p>}
    </Card>
  )
}

function ConfigTab({ queryClient }: { queryClient: ReturnType<typeof useQueryClient> }) {
  const { data: config, refetch } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: adminGetConfig,
  })
  const [draftRate, setDraftRate] = useState<number | null>(null)
  const rate = draftRate ?? config?.topUpRate ?? 0.3
  const patchMutation = useMutation({
    mutationFn: adminPatchConfig,
    onSuccess: () => {
      toast.success('Config updated')
      setDraftRate(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] })
    },
  })

  return (
    <Card className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-mahogany mb-1">Gemini top-up rate (0–1)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={rate}
            onChange={(e) => setDraftRate(parseFloat(e.target.value))}
            className="flex-1"
            aria-label="Gemini top-up rate"
            title="Gemini top-up rate 0 to 1"
          />
          <span className="text-sm tabular-nums w-12">{rate}</span>
        </div>
      </div>
      <Button
        onClick={() => patchMutation.mutate({ topUpRate: rate })}
        disabled={patchMutation.isPending}
      >
        Save config
      </Button>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
    </Card>
  )
}

function SessionsTab() {
  const { data: sessions = [], refetch } = useQuery({
    queryKey: ['admin', 'sessions'],
    queryFn: () => adminGetSessions(50),
  })

  return (
    <Card className="p-4 space-y-4">
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Session ID</th>
              <th className="p-2">Played at</th>
              <th className="p-2">Teams</th>
              <th className="p-2">Winner</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s: { sessionId: string; playedAt?: string; teams?: { name: string }[]; winner?: string }) => (
              <tr key={s.sessionId} className="border-b">
                <td className="p-2 font-mono text-xs truncate max-w-[180px]">{s.sessionId}</td>
                <td className="p-2 text-xs">{s.playedAt ? new Date(s.playedAt).toLocaleString() : '—'}</td>
                <td className="p-2">{s.teams?.map((t) => t.name).join(', ') ?? '—'}</td>
                <td className="p-2">{s.winner ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sessions.length === 0 && <p className="text-warmBrown text-sm">No sessions yet.</p>}
    </Card>
  )
}

export { ADMIN_PATH }
