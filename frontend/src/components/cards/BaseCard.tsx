import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CardMode, CardResponse } from '@/types/game'
import { Timer } from '@/components/game/Timer'
import { useTimer } from '@/hooks/useTimer'
import { MODE_COLORS, MODE_LABELS, MODE_DURATIONS } from '@/lib/gameModes'

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
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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

        <div className="min-h-[180px] sm:min-h-[200px] flex items-center justify-center py-4">
          {children}
        </div>

        {showScoreButtons && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                timer.pause()
                onScore(2)
              }}
              className="bg-green-600 hover:bg-green-700 text-white min-h-[44px] min-w-[44px] px-6 py-3 text-base"
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
              className="min-h-[44px] min-w-[44px] px-6 py-3 text-base"
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
