import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { GAME_MODES, MODE_COLORS, MODE_LABELS, MODE_EMOJIS, MODE_DESCRIPTIONS } from '@/lib/gameModes'
import type { CardMode } from '@/types/game'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

interface ModeSelectionScreenProps {
  currentTeamName: string
  onSelectMode: (mode: CardMode) => void
}

export function ModeSelectionScreen({ currentTeamName, onSelectMode }: ModeSelectionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-mahogany">Choose Your Challenge</h3>
          <p className="text-warmBrown text-sm mt-1">
            <span className="font-semibold">{currentTeamName}</span> — pick the mode you want to play
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {GAME_MODES.map((mode, index) => (
            <motion.button
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectMode(mode)}
              className="text-left rounded-xl border-2 p-4 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                borderColor: hexToRgba(MODE_COLORS[mode], 0.6),
                backgroundColor: hexToRgba(MODE_COLORS[mode], 0.08),
              }}
              aria-label={`Select ${MODE_LABELS[mode]} mode`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl leading-none" role="img" aria-hidden="true">
                  {MODE_EMOJIS[mode]}
                </span>
                <span className="font-bold text-mahogany text-sm leading-tight">
                  {MODE_LABELS[mode]}
                </span>
              </div>
              <p className="text-xs text-warmBrown leading-snug">
                {MODE_DESCRIPTIONS[mode]}
              </p>
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
