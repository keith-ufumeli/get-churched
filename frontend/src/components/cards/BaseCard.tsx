import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CardMode, CardResponse } from '@/types/game'
import { Timer } from '@/components/game/Timer'
import { useTimer } from '@/hooks/useTimer'

const MODE_COLORS: Record<CardMode, string> = {
  sing: '#FFD700',
  act: '#DC2626',
  explain: '#2563EB',
  trivia: '#16A34A',
  hum: '#9333EA',
  whoami: '#FB923C',
  fillinblank: '#14B8A6',
  taboo: '#DC2626',
  oneword: '#1E3A8A',
  draw: '#F59E0B',
}

const MODE_LABELS: Record<CardMode, string> = {
  sing: 'Sing',
  act: 'Act',
  explain: 'Explain',
  trivia: 'Trivia',
  hum: 'Hum',
  whoami: 'Who Am I',
  fillinblank: 'Fill in Blank',
  taboo: 'Taboo',
  oneword: 'One Word',
  draw: 'Draw',
}

const MODE_DURATIONS: Record<CardMode, number> = {
  sing: 60,
  act: 60,
  explain: 60,
  trivia: 0,
  hum: 60,
  whoami: 90,
  fillinblank: 0,
  taboo: 60,
  oneword: 30,
  draw: 90,
}

interface BaseCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
  children: React.ReactNode
  className?: string
  showScoreButtons?: boolean
}

export function BaseCard({ card, mode, onScore, children, className, showScoreButtons = true }: BaseCardProps) {
  void card // required by BaseCardProps, used by specific card UIs
  const duration = MODE_DURATIONS[mode]
  const timer = useTimer(duration, () => {
    if (duration > 0) {
      onScore(0)
    }
  })

  useEffect(() => {
    if (duration > 0) {
      const startTimer = timer.start
      startTimer()
      return () => {
        timer.pause()
      }
    }
  }, [duration]) // eslint-disable-line react-hooks/exhaustive-deps

  const modeColor = MODE_COLORS[mode]
  const modeLabel = MODE_LABELS[mode]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('w-full', className)}
    >
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Badge
              className="text-sm font-semibold px-3 py-1"
              style={{ backgroundColor: modeColor, color: 'white', border: 'none' }}
            >
              {modeLabel}
            </Badge>
          </motion.div>
          {duration > 0 && (
            <Timer
              duration={duration}
              timeLeft={timer.timeLeft}
              onComplete={timer.pause}
              color={`bg-[${modeColor}]`}
            />
          )}
        </div>

        <div className="min-h-[200px] flex items-center justify-center">
          {children}
        </div>

        {showScoreButtons && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                timer.pause()
                onScore(2)
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Correct (+2pts)
            </Button>
            <Button
              onClick={() => {
                timer.pause()
                onScore(0)
              }}
              variant="destructive"
              size="lg"
            >
              Incorrect (0pts)
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
