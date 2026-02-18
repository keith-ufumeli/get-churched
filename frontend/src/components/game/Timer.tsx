import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TimerProps {
  duration: number
  timeLeft: number
  onComplete?: () => void
  color?: string
  className?: string
}

export function Timer({ duration, timeLeft, color = 'bg-mahogany', className }: TimerProps) {
  const progress = (timeLeft / duration) * 100

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-warmBrown">Time Remaining</span>
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.2, color: '#DC2626' }}
          animate={{ scale: 1, color: timeLeft <= 10 ? '#DC2626' : '#4A1C0E' }}
          className="font-bold text-lg tabular-nums"
        >
          {timeLeft}s
        </motion.span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-3" />
        <motion.div
          className={cn('absolute inset-0 rounded-full', color)}
          style={{ opacity: 0.2 }}
          animate={{ opacity: timeLeft <= 10 ? [0.2, 0.4, 0.2] : 0.2 }}
          transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
        />
      </div>
    </div>
  )
}
