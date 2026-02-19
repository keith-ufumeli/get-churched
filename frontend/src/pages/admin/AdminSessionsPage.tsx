import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { adminGetSessions } from '@/lib/adminApi'
import { RefreshCw } from 'lucide-react'

const PAGE_SIZE = 10
type SessionRow = {
  sessionId: string
  playedAt?: string
  teams?: { name: string }[]
  winner?: string
  totalRounds?: number
  difficulty?: string
}

export function AdminSessionsPage() {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<keyof SessionRow>('playedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'sessions'],
    queryFn: () => adminGetSessions(50),
    refetchOnWindowFocus: false,
  })

  const rows = useMemo(() => {
    const list = [...(sessions as SessionRow[])]
    list.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (sortKey === 'playedAt') {
        const aDate = aVal ? new Date(aVal as string).getTime() : 0
        const bDate = bVal ? new Date(bVal as string).getTime() : 0
        return sortDir === 'asc' ? aDate - bDate : bDate - aDate
      }
      if (sortKey === 'teams') {
        const aStr = Array.isArray(aVal) ? (aVal as { name: string }[]).map((t) => t.name).join(', ') : ''
        const bStr = Array.isArray(bVal) ? (bVal as { name: string }[]).map((t) => t.name).join(', ') : ''
        const cmp = aStr.localeCompare(bStr)
        return sortDir === 'asc' ? cmp : -cmp
      }
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [sessions, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paginatedRows = useMemo(
    () => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rows, page]
  )

  const handleSort = (key: keyof SessionRow) => {
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
          <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Game session history.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions list</CardTitle>
          <p className="text-sm text-muted-foreground">{rows.length} session(s)</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button type="button" className="font-medium hover:underline" onClick={() => handleSort('sessionId')}>
                          Session ID
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="font-medium hover:underline" onClick={() => handleSort('playedAt')}>
                          Played at
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="font-medium hover:underline" onClick={() => handleSort('teams')}>
                          Teams
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" className="font-medium hover:underline" onClick={() => handleSort('winner')}>
                          Winner
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No sessions yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((s) => (
                        <TableRow key={s.sessionId}>
                          <TableCell className="font-mono text-xs max-w-[180px] truncate" title={s.sessionId}>
                            {s.sessionId}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {s.playedAt ? new Date(s.playedAt).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {s.teams?.map((t) => t.name).join(', ') ?? '—'}
                          </TableCell>
                          <TableCell>{s.winner ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
