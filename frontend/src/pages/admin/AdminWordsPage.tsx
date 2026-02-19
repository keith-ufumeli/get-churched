import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { adminGetWords, adminAddWord, adminDeleteWord } from '@/lib/adminApi'
import { GAME_MODES } from '@/lib/gameModes'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10
type WordRow = { _id: string; mode: string; word: string; difficulty?: string; country?: string }

export function AdminWordsPage() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState('')
  const [word, setWord] = useState('')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<keyof WordRow>('mode')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filterMode, setFilterMode] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<WordRow | null>(null)

  const { data: words = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'words'],
    queryFn: () => adminGetWords(),
    refetchOnWindowFocus: false,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'words'] })
      setDeleteTarget(null)
      toast.success('Word deleted')
    },
    onError: () => {
      toast.error('Failed to delete word')
    },
  })

  const rows = useMemo(() => {
    let list = words as WordRow[]
    if (filterMode) {
      list = list.filter((w) => w.mode === filterMode)
    }
    list = [...list].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [words, filterMode, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paginatedRows = useMemo(
    () => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rows, page]
  )

  const handleSort = (key: keyof WordRow) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleAdd = () => {
    const m = mode.trim()
    const w = word.trim()
    if (!m || !w) return
    addMutation.mutate({ mode: m, word: w })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Words</h1>
          <p className="text-muted-foreground">Manage custom words per mode.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add word</CardTitle>
          <p className="text-sm text-muted-foreground">Select mode and enter a word.</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-end">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {GAME_MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="flex-1 min-w-[120px]"
          />
          <Button onClick={handleAdd} disabled={addMutation.isPending}>
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Words list</CardTitle>
            <p className="text-sm text-muted-foreground">
              {rows.length} word{rows.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={filterMode || 'all'} onValueChange={(v) => (setFilterMode(v === 'all' ? '' : v), setPage(0))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                {GAME_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
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
                        <button
                          type="button"
                          className="font-medium hover:underline"
                          onClick={() => handleSort('mode')}
                        >
                          Mode
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="font-medium hover:underline"
                          onClick={() => handleSort('word')}
                        >
                          Word
                        </button>
                      </TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No words yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((w) => (
                        <TableRow key={w._id}>
                          <TableCell>{w.mode}</TableCell>
                          <TableCell>{w.word}</TableCell>
                          <TableCell>{w.difficulty ?? '—'}</TableCell>
                          <TableCell>{w.country ?? '—'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(w)}
                            >
                              Delete
                            </Button>
                          </TableCell>
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete word</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.word}&quot; ({deleteTarget?.mode})? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
