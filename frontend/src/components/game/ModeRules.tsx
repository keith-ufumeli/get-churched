import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MODE_LABELS, MODE_RULES } from '@/lib/gameModes'
import type { CardMode } from '@/types/game'

interface ModeRulesProps {
  mode: CardMode
  onDismiss: () => void
}

export function ModeRules({ mode, onDismiss }: ModeRulesProps) {
  const rules = MODE_RULES[mode] ?? ''
  const label = MODE_LABELS[mode] ?? mode

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="p-6 space-y-5">
        <h3 className="text-xl font-bold text-mahogany">Rules: {label}</h3>
        <p className="text-warmBrown leading-relaxed whitespace-pre-wrap">{rules}</p>
        <Button onClick={onDismiss} className="w-full" size="lg">
          Got it — Start round
        </Button>
      </Card>
    </motion.div>
  )
}
