import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  GAME_MODES,
  MODE_COLORS,
  MODE_LABELS,
  MODE_ICONS,
  MODE_DESCRIPTIONS,
} from '@/lib/gameModes'
import type { CardMode } from '@/types/game'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

interface RoundSetConfigProps {
  currentTeamName: string
  remainingRounds: number
  onComplete: (mode: CardMode, roundsPerMode: number) => void
}

export function RoundSetConfig({
  currentTeamName,
  remainingRounds,
  onComplete,
}: RoundSetConfigProps) {
  const [step, setStep] = useState<'mode' | 'rounds'>('mode')
  const [selectedMode, setSelectedMode] = useState<CardMode | null>(null)
  const [roundsInSet, setRoundsInSet] = useState(Math.min(3, remainingRounds))

  const handleSelectMode = (mode: CardMode) => {
    setSelectedMode(mode)
    setRoundsInSet(Math.min(roundsInSet, remainingRounds))
    setStep('rounds')
  }

  const handleConfirm = () => {
    if (!selectedMode || roundsInSet < 1) return
    const capped = Math.min(Math.max(1, roundsInSet), remainingRounds)
    onComplete(selectedMode, capped)
  }

  const roundsValue = Math.min(Math.max(1, roundsInSet), remainingRounds)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-mahogany">
            {step === 'mode' ? 'Choose mode for this set' : 'How many rounds in this set?'}
          </h3>
          <p className="text-warmBrown text-sm mt-1">
            <span className="font-semibold">{currentTeamName}</span>
            {step === 'mode'
              ? ' — pick one mode; all rounds in this set will use it.'
              : ` — up to ${remainingRounds} rounds left.`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'mode' && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {GAME_MODES.map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectMode(mode)}
                  className="text-left rounded-xl border-2 p-4 min-h-[44px] transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 touch-manipulation"
                  style={{
                    borderColor: hexToRgba(MODE_COLORS[mode], 0.6),
                    backgroundColor: hexToRgba(MODE_COLORS[mode], 0.08),
                  }}
                  aria-label={`Select ${MODE_LABELS[mode]} mode`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const Icon = MODE_ICONS[mode]
                      return <Icon className="h-5 w-5 shrink-0 text-mahogany" aria-hidden />
                    })()}
                    <span className="font-bold text-mahogany text-sm leading-tight">
                      {MODE_LABELS[mode]}
                    </span>
                  </div>
                  <p className="text-xs text-warmBrown leading-snug">
                    {MODE_DESCRIPTIONS[mode]}
                  </p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === 'rounds' && selectedMode && (
            <motion.div
              key="rounds"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-warmBrown text-sm">
                Selected: <strong className="text-mahogany">{MODE_LABELS[selectedMode]}</strong>. All rounds in this set will use this mode.
              </p>
              <div>
                <label className="block text-sm font-medium text-mahogany mb-2">
                  Rounds in this set (1–{remainingRounds})
                </label>
                <Input
                  type="number"
                  min={1}
                  max={remainingRounds}
                  value={roundsValue}
                  onChange={(e) => setRoundsInSet(parseInt(e.target.value, 10) || 1)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('mode')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Start set
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
