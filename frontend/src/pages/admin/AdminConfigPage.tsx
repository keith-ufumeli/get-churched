import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { adminGetConfig, adminPatchConfig } from '@/lib/adminApi'
import { GAME_MODES } from '@/lib/gameModes'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminConfigPage() {
  const queryClient = useQueryClient()
  const [draftRate, setDraftRate] = useState<number | null>(null)
  const [draftModes, setDraftModes] = useState<string[] | null>(null)

  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: adminGetConfig,
    refetchOnWindowFocus: false,
  })

  const patchMutation = useMutation({
    mutationFn: adminPatchConfig,
    onSuccess: () => {
      toast.success('Config updated')
      setDraftRate(null)
      setDraftModes(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] })
    },
    onError: () => {
      toast.error('Failed to update config')
    },
  })

  const topUpRate = draftRate ?? config?.topUpRate ?? 0.3
  const enabledModes = useMemo(() => {
    if (draftModes !== null) return draftModes
    return config?.enabledModes ?? [...GAME_MODES]
  }, [config?.enabledModes, draftModes])

  const toggleMode = (mode: string) => {
    setDraftModes((prev) => {
      const current = prev ?? [...(config?.enabledModes ?? GAME_MODES)]
      if (current.includes(mode)) {
        const next = current.filter((m) => m !== mode)
        return next.length > 0 ? next : current
      }
      return [...current, mode]
    })
  }

  const handleSave = () => {
    patchMutation.mutate({ topUpRate, enabledModes })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Config</h1>
          <p className="text-muted-foreground">Top-up rate and enabled modes.</p>
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Config</h1>
          <p className="text-muted-foreground">Top-up rate and enabled modes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={patchMutation.isPending}>
            Save config
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gemini top-up rate</CardTitle>
          <p className="text-sm text-muted-foreground">Value between 0 and 1. Controls AI fallback rate.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[topUpRate]}
              onValueChange={([v]) => setDraftRate(v)}
              className="max-w-[300px]"
              aria-label="Top-up rate 0 to 1"
            />
            <span className="text-sm tabular-nums w-12 font-medium">{topUpRate}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enabled modes</CardTitle>
          <p className="text-sm text-muted-foreground">Toggle which game modes are available.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {GAME_MODES.map((mode) => (
              <div key={mode} className="flex items-center justify-between rounded-lg border p-3">
                <label htmlFor={`mode-${mode}`} className="cursor-pointer flex-1 text-sm font-medium">
                  {mode}
                </label>
                <Switch
                  id={`mode-${mode}`}
                  checked={enabledModes.includes(mode)}
                  onCheckedChange={() => toggleMode(mode)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
