import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { adminGetUsage } from '@/lib/adminApi'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { RefreshCw, AlertCircle } from 'lucide-react'

const chartConfig = {
  calls: { label: 'Calls', color: 'hsl(var(--chart-1))' },
  tokens: { label: 'Tokens', color: 'hsl(var(--chart-2))' },
}

export function AdminUsagePage() {
  const [sortKey, setSortKey] = useState<'sessionId' | 'calls' | 'tokens' | 'failures' | 'fallbacks'>('calls')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const { data: usage = {}, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: adminGetUsage,
    refetchOnWindowFocus: false,
  })

  const entries = useMemo(() => {
    const list = Object.entries(usage as Record<string, { calls: number; tokens: number; failures: number; fallbacks?: number }>).map(
      ([sessionId, v]) => ({
        sessionId,
        shortId: sessionId.slice(0, 12) + (sessionId.length > 12 ? '…' : ''),
        calls: v.calls ?? 0,
        tokens: v.tokens ?? 0,
        failures: v.failures ?? 0,
        fallbacks: v.fallbacks ?? 0,
      })
    )
    return [...list].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = typeof aVal === 'number' && typeof bVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [usage, sortKey, sortDir])

  const topByCalls = useMemo(() => entries.slice(0, 15), [entries])
  const topByTokens = useMemo(
    () => [...entries].sort((a, b) => b.tokens - a.tokens).slice(0, 15),
    [entries]
  )

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Usage</h1>
          <p className="text-muted-foreground">API calls and token consumption.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load usage data</AlertTitle>
          <AlertDescription>
            Could not load AI usage metrics. Please try again.
            <Button variant="outline" size="sm" className="ml-2 mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calls by session (top 15)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : topByCalls.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No usage recorded yet.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={topByCalls} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortId" />
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
            <CardTitle>Tokens by session (top 15)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : topByTokens.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No usage recorded yet.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={topByTokens} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortId" />
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
          <CardTitle>Usage table</CardTitle>
          <p className="text-sm text-muted-foreground">{entries.length} session(s)</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button type="button" className="font-medium hover:underline" onClick={() => handleSort('sessionId')}>
                        Session
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:underline" onClick={() => handleSort('calls')}>
                        Calls
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:underline" onClick={() => handleSort('tokens')}>
                        Tokens
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:underline" onClick={() => handleSort('failures')}>
                        Failures
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" className="font-medium hover:underline" onClick={() => handleSort('fallbacks')}>
                        Fallbacks
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No usage recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((e) => (
                      <TableRow key={e.sessionId}>
                        <TableCell className="font-mono text-xs max-w-[200px] truncate" title={e.sessionId}>
                          {e.sessionId}
                        </TableCell>
                        <TableCell>{e.calls}</TableCell>
                        <TableCell>{e.tokens.toLocaleString()}</TableCell>
                        <TableCell>{e.failures}</TableCell>
                        <TableCell>{e.fallbacks}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
