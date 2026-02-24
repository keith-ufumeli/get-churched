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
import { Check, X } from 'lucide-react'

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
      <Card className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-white/95 backdrop-blur-md border-gold/20 shadow-2xl shadow-mahogany/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream/50 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between z-10">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Badge
              className="text-sm font-bold px-4 py-1.5 shadow-sm"
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

        <div className="relative z-10 min-h-[180px] sm:min-h-[200px] flex items-center justify-center py-6">
          {children}
        </div>

        {showScoreButtons && (
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center sm:px-8 pt-4 border-t border-mahogany/10">
            <Button
              onClick={() => {
                timer.pause()
                onScore(2)
              }}
              className="bg-green-600 hover:bg-green-700 text-white min-h-[56px] px-8 text-lg font-bold shadow-md hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Correct (+2)
            </Button>
            <Button
              onClick={() => {
                timer.pause()
                onScore(0)
              }}
              variant="destructive"
              className="min-h-[56px] px-8 text-lg font-bold shadow-md hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto"
              size="lg"
            >
              <X className="w-5 h-5 mr-2" />
              Incorrect (0)
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
