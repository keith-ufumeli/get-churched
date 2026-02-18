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
      <div className="w-full space-y-6">
        <p className="text-xl font-serif text-center text-mahogany px-4 leading-relaxed">
          {fillCard.verse}
        </p>

        <div className="space-y-4">
          <Input
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !revealed && handleCheck()}
            disabled={revealed}
            className="text-center text-lg"
          />

          <Button
            onClick={handleCheck}
            disabled={revealed || !answer.trim()}
            className="w-full"
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
