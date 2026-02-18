import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseCard } from './BaseCard'
import { Button } from '@/components/ui/button'
import type { CardMode, CardResponse, TriviaCard as TriviaCardType } from '@/types/game'
import { CheckCircle2, XCircle } from 'lucide-react'

interface TriviaCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function TriviaCard({ card, mode, onScore }: TriviaCardProps) {
  const triviaCard = card as TriviaCardType
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (option: string) => {
    if (revealed) return
    setSelectedAnswer(option)
    setRevealed(true)
    const isCorrect = option === triviaCard.a
    setTimeout(() => {
      onScore(isCorrect ? 2 : 0)
    }, 1500)
  }

  return (
    <BaseCard card={card} mode={mode} onScore={onScore} showScoreButtons={false}>
      <div className="w-full space-y-6">
        <p className="text-xl font-serif text-center text-mahogany px-4">
          {triviaCard.q}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {triviaCard.options.map((option, index) => {
            const isCorrect = option === triviaCard.a
            const isSelected = selectedAnswer === option
            const showResult = revealed && isSelected

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleSelect(option)}
                  disabled={revealed}
                  variant={showResult ? (isCorrect ? 'default' : 'destructive') : 'outline'}
                  className="w-full h-auto p-4 text-left justify-start relative"
                >
                  <AnimatePresence>
                    {showResult && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2"
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <XCircle className="h-5 w-5 text-white" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="pr-8">{option}</span>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-warmBrown">
              Correct answer: <span className="font-semibold text-mahogany">{triviaCard.a}</span>
            </p>
          </motion.div>
        )}
      </div>
    </BaseCard>
  )
}
