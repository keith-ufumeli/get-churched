import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Play } from 'lucide-react'
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
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="p-8 sm:p-10 space-y-8 bg-cream/90 backdrop-blur-md border-gold/20 shadow-xl shadow-mahogany/5">
        <div className="pb-4 border-b border-mahogany/10">
          <h3 className="text-2xl font-bold text-mahogany">
            {step === 'mode' ? 'Choose mode for this set' : 'How many rounds in this set?'}
          </h3>
          <p className="text-warmBrown text-base mt-2">
            <span className="font-semibold text-mahogany">{currentTeamName}</span>
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
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectMode(mode)}
                  className="text-left rounded-xl border-2 p-5 min-h-[44px] transition-all bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-gold/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 touch-manipulation group relative overflow-hidden"
                  style={{
                    borderColor: hexToRgba(MODE_COLORS[mode], 0.3),
                  }}
                  aria-label={`Select ${MODE_LABELS[mode]} mode`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: hexToRgba(MODE_COLORS[mode], 0.05) }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      {(() => {
                        const Icon = MODE_ICONS[mode]
                        return (
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: hexToRgba(MODE_COLORS[mode], 0.1) }}
                          >
                            <Icon className="h-5 w-5 shrink-0 text-mahogany" aria-hidden />
                          </div>
                        )
                      })()}
                      <span className="font-bold text-mahogany text-lg leading-tight group-hover:text-gold transition-colors">
                        {MODE_LABELS[mode]}
                      </span>
                    </div>
                    <p className="text-sm text-warmBrown leading-snug">
                      {MODE_DESCRIPTIONS[mode]}
                    </p>
                  </div>
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
              <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50 mb-6">
                <p className="text-warmBrown text-base">
                  Selected: <strong className="text-mahogany text-lg">{MODE_LABELS[selectedMode]}</strong>
                  <br/>
                  <span className="text-sm opacity-90 mt-1 block">All rounds in this set will use this mode.</span>
                </p>
              </div>
              <div className="space-y-3 mb-8">
                <label className="block text-base font-semibold text-mahogany">
                  Number of rounds (1–{remainingRounds})
                </label>
                <Input
                  type="number"
                  min={1}
                  max={remainingRounds}
                  value={roundsValue}
                  onChange={(e) => setRoundsInSet(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-lg py-6 rounded-xl border border-mahogany/20 bg-white/70 backdrop-blur-sm px-4 text-mahogany focus-visible:ring-2 focus-visible:ring-gold transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 pt-4 border-t border-mahogany/10">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('mode')} 
                  className="sm:w-1/3 text-warmBrown hover:bg-mahogany/5 hover:text-mahogany font-medium px-6 py-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Modes
                </Button>
                
                <motion.div className="sm:w-2/3" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleConfirm} 
                    className="w-full relative group overflow-hidden px-8 py-6 text-lg shadow-xl shadow-amber-900/10 bg-gradient-to-b from-mahogany to-[#5A2E2A] border font-semibold border-gold text-cream transition-all duration-300 hover:shadow-amber-700/20 hover:shadow-2xl hover:border-amber-300"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                    Start {roundsValue} {roundsValue === 1 ? 'Round' : 'Rounds'}
                    <Play className="h-4 w-4 ml-2 fill-current opacity-90" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
