import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { useCard } from '@/hooks/useCard'
import { ScoreBoard } from '@/components/game/ScoreBoard'
import { RoundSetConfig } from '@/components/game/RoundSetConfig'
import { ModeRules } from '@/components/game/ModeRules'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { normalizeCardKey } from '@/lib/cardUtils'
import type { CardMode, CardResponse } from '@/types/game'
import {
  SingCard,
  ActCard,
  ExplainCard,
  TriviaCard,
  HumCard,
  WhoAmICard,
  FillInBlankCard,
  TabooCard,
  OneWordCard,
  DrawCard,
} from '@/components/cards'
import { Loader2, Trophy, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { MODE_LABELS } from '@/lib/gameModes'

function CardRenderer({ card, mode, onScore }: { card: CardResponse; mode: CardMode; onScore: (points: number) => void }) {
  switch (mode) {
    case 'sing':
      return <SingCard card={card} mode={mode} onScore={onScore} />
    case 'act':
      return <ActCard card={card} mode={mode} onScore={onScore} />
    case 'explain':
      return <ExplainCard card={card} mode={mode} onScore={onScore} />
    case 'trivia':
      return <TriviaCard card={card} mode={mode} onScore={onScore} />
    case 'hum':
      return <HumCard card={card} mode={mode} onScore={onScore} />
    case 'whoami':
      return <WhoAmICard card={card} mode={mode} onScore={onScore} />
    case 'fillinblank':
      return <FillInBlankCard card={card} mode={mode} onScore={onScore} />
    case 'taboo':
      return <TabooCard card={card} mode={mode} onScore={onScore} />
    case 'oneword':
      return <OneWordCard card={card} mode={mode} onScore={onScore} />
    case 'draw':
      return <DrawCard card={card} mode={mode} onScore={onScore} />
    default:
      return null
  }
}

export function RoundPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const { mutate: generateCard, isPending, card, error } = useCard()
  const scoredForRoundRef = useRef(false)
  const [showModeCompleteConfetti, setShowModeCompleteConfetti] = useState(false)

  const totalRounds = state.teams.length * state.roundsPerTeam
  const remainingRounds = totalRounds - state.rounds.length
  const mode = state.selectedMode
  const { gamePhase } = state

  const cardOptions = useMemo(
    () => ({
      mode: mode!,
      difficulty: state.difficulty,
      country: state.hymnCountry || undefined,
      usedPrompts: state.usedCards,
      sessionId: state.sessionId,
    }),
    [mode, state.difficulty, state.hymnCountry, state.usedCards, state.sessionId]
  )

  useEffect(() => {
    if (state.status !== 'playing') {
      navigate('/setup')
    }
  }, [state.status, navigate])

  useEffect(() => {
    if (gamePhase === 'ROUND_ACTIVE') {
      scoredForRoundRef.current = false
    }
  }, [gamePhase, state.rounds.length])

  useEffect(() => {
    if (gamePhase !== 'MODE_COMPLETE') return
    const start = setTimeout(() => setShowModeCompleteConfetti(true), 0)
    const stop = setTimeout(() => setShowModeCompleteConfetti(false), 4000)
    return () => {
      clearTimeout(start)
      clearTimeout(stop)
    }
  }, [gamePhase])

  useEffect(() => {
    if (state.status !== 'playing') return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [state.status])

  useEffect(() => {
    if (error && mode) {
      toast.error('Failed to load card. Using fallback card.')
      setTimeout(() => generateCard({ ...cardOptions, mode }), 1000)
    }
  }, [error]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gamePhase === 'ROUND_ACTIVE' && state.selectedMode && !card && !isPending) {
      generateCard({ ...cardOptions, mode: state.selectedMode })
    }
  }, [gamePhase, state.selectedMode, card, isPending]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundSetComplete = (selectedMode: CardMode, roundsPerMode: number) => {
    dispatch({ type: 'START_ROUND_SET', payload: { selectedMode, roundsPerMode } })
  }

  const handleRulesDismiss = () => {
    dispatch({ type: 'DISMISS_RULES' })
  }

  const handleScore = (points: number) => {
    if (!mode || !card) return
    if (scoredForRoundRef.current) return

    const currentTeam = state.teams[state.currentTeamIndex]
    if (!currentTeam) return

    scoredForRoundRef.current = true
    dispatch({
      type: 'SCORE_ROUND',
      payload: {
        teamName: currentTeam.name,
        mode,
        card,
        pointsEarned: points,
        timestamp: new Date().toISOString(),
        usedCardKey: normalizeCardKey(card),
      },
    })

    navigate('/result')
  }

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME' })
    navigate('/scoreboard')
  }

  if (state.status !== 'playing') {
    return null
  }

  const currentTeam = state.teams[state.currentTeamIndex]
  const setProgressLabel =
    mode && state.totalRoundsForMode > 0
      ? `Set: ${state.currentRoundIndexInSet + 1} of ${state.totalRoundsForMode} in ${MODE_LABELS[mode]}`
      : null
  const gameProgressLabel = `Game: ${state.rounds.length + 1} of ${totalRounds}`
  const showLockedBadge =
    (gamePhase === 'SHOW_RULES' || gamePhase === 'ROUND_ACTIVE') &&
    mode &&
    state.totalRoundsForMode > 0

  const showEndGameEarly =
    gamePhase === 'MODE_SELECTED' || gamePhase === 'SHOW_RULES' || gamePhase === 'ROUND_ACTIVE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('min-h-screen bg-parchment p-4 sm:p-6 font-sans relative')}
    >
      {showModeCompleteConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={150}
        />
      )}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div>
            <h2 className="text-2xl font-bold text-mahogany mb-2">
              {currentTeam?.name}'s Turn
            </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-warmBrown">
            {showLockedBadge && mode && (
              <Badge variant="secondary" className="font-medium" title="Mode locked for this set">
                {MODE_LABELS[mode]} – {state.currentRoundIndexInSet + 1}/{state.totalRoundsForMode}
              </Badge>
            )}
            {setProgressLabel && !showLockedBadge && (
              <span className="font-medium text-mahogany" title="Set progress">
                {setProgressLabel}
              </span>
            )}
            <span>{gameProgressLabel}</span>
          </div>
          </div>
          {showEndGameEarly && (
            <Button
              variant="ghost"
              size="sm"
              className="text-warmBrown shrink-0 self-start sm:self-center"
              onClick={handleEndGame}
            >
              End game early
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            {gamePhase === 'MODE_SELECTED' && (
              <RoundSetConfig
                currentTeamName={currentTeam?.name ?? ''}
                remainingRounds={remainingRounds}
                onComplete={handleRoundSetComplete}
              />
            )}
            {gamePhase === 'MODE_COMPLETE' && state.selectedMode && (
              <Card className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <Sparkles className="h-14 w-14 text-gold" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-mahogany">
                    {MODE_LABELS[state.selectedMode]} complete!
                  </h3>
                  <p className="text-warmBrown">
                    You finished {state.totalRoundsForMode} rounds. Choose the next mode or end the game.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={() => dispatch({ type: 'CLEAR_MODE_COMPLETE' })} variant="outline" className="sm:min-w-[160px]">
                      Next mode
                    </Button>
                    <Button onClick={handleEndGame} className="sm:min-w-[160px]">
                      <Trophy className="h-4 w-4 mr-2" />
                      End game
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            {gamePhase === 'SHOW_RULES' && state.selectedMode && (
              <ModeRules mode={state.selectedMode} onDismiss={handleRulesDismiss} />
            )}
            {gamePhase === 'ROUND_ACTIVE' && (
              <>
                {isPending || !card || !mode ? (
                  <Card className="p-12 flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-mahogany mx-auto" />
                      <p className="text-warmBrown">
                        Loading your {mode ? MODE_LABELS[mode] : ''} card...
                      </p>
                    </div>
                  </Card>
                ) : (
                  <motion.div
                    key={`${mode}-${state.rounds.length}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardRenderer card={card} mode={mode} onScore={handleScore} />
                  </motion.div>
                )}
              </>
            )}
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
      </div>
    </motion.div>
  )
}
