import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { adminGetWords, adminGetUsage, adminGetSessions } from '@/lib/adminApi'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'

const chartConfig = {
  calls: { label: 'Calls', color: 'hsl(var(--chart-1))' },
  tokens: { label: 'Tokens', color: 'hsl(var(--chart-2))' },
  sessions: { label: 'Sessions', color: 'hsl(var(--chart-3))' },
}

export function AdminDashboardPage() {
  const { data: words = [], isLoading: wordsLoading } = useQuery({
    queryKey: ['admin', 'words'],
    queryFn: () => adminGetWords(),
    refetchOnWindowFocus: false,
  })
  const { data: usage = {}, isLoading: usageLoading } = useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: adminGetUsage,
    refetchOnWindowFocus: false,
  })
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin', 'sessions'],
    queryFn: () => adminGetSessions(50),
    refetchOnWindowFocus: false,
  })

  const usageEntries = useMemo(
    () =>
      Object.entries(usage as Record<string, { calls: number; tokens: number; failures: number }>).map(
        ([sessionId, v]) => ({
          sessionId: sessionId.slice(0, 8),
          fullId: sessionId,
          calls: v.calls,
          tokens: v.tokens,
          failures: v.failures,
        })
      ),
    [usage]
  )
  const topUsageByCalls = useMemo(
    () => [...usageEntries].sort((a, b) => b.calls - a.calls).slice(0, 15),
    [usageEntries]
  )
  const topUsageByTokens = useMemo(
    () => [...usageEntries].sort((a, b) => b.tokens - a.tokens).slice(0, 15),
    [usageEntries]
  )
  const sessionsByDay = useMemo(() => {
    const byDay: Record<string, number> = {}
    for (const s of sessions as { playedAt?: string }[]) {
      if (!s.playedAt) continue
      const day = new Date(s.playedAt).toISOString().slice(0, 10)
      byDay[day] = (byDay[day] ?? 0) + 1
    }
    return Object.entries(byDay)
      .map(([date, count]) => ({ date, sessions: count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
  }, [sessions])

  const totalCalls = useMemo(
    () => usageEntries.reduce((acc, u) => acc + u.calls, 0),
    [usageEntries]
  )
  const totalTokens = useMemo(
    () => usageEntries.reduce((acc, u) => acc + u.tokens, 0),
    [usageEntries]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview and metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total words
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wordsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-bold">{(words as unknown[]).length}</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-bold">{(sessions as unknown[]).length}</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-bold">{totalCalls.toLocaleString()}</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-bold">{totalTokens.toLocaleString()}</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API calls by session (top 15)</CardTitle>
            <p className="text-sm text-muted-foreground">Calls per session</p>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : topUsageByCalls.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No usage recorded yet.
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart data={topUsageByCalls} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionId" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="calls" fill="var(--color-calls)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Token consumption by session (top 15)</CardTitle>
            <p className="text-sm text-muted-foreground">Tokens per session</p>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : topUsageByTokens.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No usage recorded yet.
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart data={topUsageByTokens} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionId" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="tokens" fill="var(--color-tokens)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions per day</CardTitle>
          <p className="text-sm text-muted-foreground">Last 14 days</p>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : sessionsByDay.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sessions yet.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={sessionsByDay} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
