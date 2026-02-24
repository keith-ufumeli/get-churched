import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseCard } from './BaseCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { CardMode, CardResponse, FillInBlankCard as FillInBlankCardType } from '@/types/game'
import { CheckCircle2 } from 'lucide-react'

interface FillInBlankCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function FillInBlankCard({ card, mode, onScore }: FillInBlankCardProps) {
  const fillCard = card as FillInBlankCardType
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleCheck = () => {
    if (revealed) return
    const correct = answer.trim().toLowerCase() === fillCard.answer.toLowerCase()
    setIsCorrect(correct)
    setRevealed(true)
    setTimeout(() => {
      onScore(correct ? 2 : 0)
    }, 2000)
  }

  return (
    <BaseCard card={card} mode={mode} onScore={onScore} showScoreButtons={false}>
      <div className="w-full space-y-8">
        <p className="text-2xl sm:text-3xl font-serif text-center text-mahogany px-4 leading-relaxed font-bold tracking-tight">
          {fillCard.verse}
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
          <Input
            placeholder="Type missing word..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !revealed && answer.trim() && handleCheck()}
            disabled={revealed}
            className="text-center text-xl h-14 bg-white/50 backdrop-blur-sm border-gold/40 focus-visible:ring-gold focus-visible:ring-2 shadow-inner"
          />

          <Button
            onClick={handleCheck}
            disabled={revealed || !answer.trim()}
            className="w-full h-14 text-lg font-bold bg-mahogany hover:bg-[#5A2E2A] text-cream"
            size="lg"
          >
            Check Answer
          </Button>
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-green-600 font-semibold">Correct!</p>
                  </>
                ) : (
                  <p className="text-red-600 font-semibold">Incorrect</p>
                )}
              </div>
              <p className="text-sm text-warmBrown">
                Answer: <span className="font-semibold text-mahogany">{fillCard.answer}</span>
              </p>
              {fillCard.ref && (
                <p className="text-xs text-warmBrown italic">{fillCard.ref}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseCard>
  )
}
