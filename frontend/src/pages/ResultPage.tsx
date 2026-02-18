import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { ScoreBoard } from '@/components/game/ScoreBoard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react'
import Confetti from 'react-confetti'
import { useState } from 'react'

const MODE_LABELS: Record<string, string> = {
  sing: 'Sing',
  act: 'Act',
  explain: 'Explain',
  trivia: 'Trivia',
  hum: 'Hum',
  whoami: 'Who Am I',
  fillinblank: 'Fill in Blank',
  taboo: 'Taboo',
  oneword: 'One Word',
  draw: 'Draw',
}

export function ResultPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const [showConfetti, setShowConfetti] = useState(false)

  const lastRound = state.rounds[state.rounds.length - 1]
  const totalRounds = state.teams.length * state.roundsPerTeam
  const roundsCompleted = state.rounds.length
  const isGameComplete = roundsCompleted >= totalRounds

  useEffect(() => {
    if (!lastRound) {
      navigate('/round')
      return
    }

    if (lastRound.pointsEarned === 2) {
      const t = setTimeout(() => {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [lastRound, navigate])

  const handleNext = () => {
    if (isGameComplete) {
      dispatch({ type: 'END_GAME' })
      navigate('/scoreboard')
    } else {
      navigate('/round')
    }
  }

  if (!lastRound) {
    return null
  }

  const currentTeam = state.teams.find((t) => t.name === lastRound.teamName)
  const isPerfect = lastRound.pointsEarned === 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('min-h-screen bg-parchment p-6 font-sans relative')}
    >
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-mahogany mb-2">Round Result</h1>
          <p className="text-warmBrown">
            Round {roundsCompleted} of {totalRounds}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="flex justify-center"
                  >
                    {isPerfect ? (
                      <CheckCircle2 className="h-16 w-16 text-green-600" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-600" />
                    )}
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-bold text-mahogany mb-2">
                      {currentTeam?.name}
                    </h2>
                    <Badge className="text-sm px-3 py-1 mb-4">
                      {MODE_LABELS[lastRound.mode] || lastRound.mode}
                    </Badge>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <p className="text-lg text-warmBrown">
                      {isPerfect ? 'Correct! Well done!' : 'Incorrect. Better luck next time!'}
                    </p>
                    <motion.p
                      key={lastRound.pointsEarned}
                      initial={{ scale: 1.2, color: '#D97706' }}
                      animate={{ scale: 1, color: '#4A1C0E' }}
                      className="text-3xl font-bold text-mahogany"
                    >
                      +{lastRound.pointsEarned} points
                    </motion.p>
                  </motion.div>

                  {typeof lastRound.card === 'string' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-6 p-4 bg-white/50 rounded-lg border border-mahogany/20"
                    >
                      <p className="text-warmBrown text-sm mb-1">Card:</p>
                      <p className="text-mahogany font-medium">{lastRound.card}</p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ScoreBoard teams={state.teams} currentTeamIndex={state.currentTeamIndex} />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button onClick={handleNext} size="lg" className="min-w-[200px]">
            {isGameComplete ? (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                View Final Scores
              </>
            ) : (
              <>
                Next Team
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
