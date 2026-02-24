import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import { motion, useReducedMotion } from 'framer-motion'
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
import { Loader2, Trophy, Sparkles, Frown } from 'lucide-react'
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
  const prefersReducedMotion = useReducedMotion()
  const { state, dispatch } = useGame()
  const { generate: generateCard, isPending, card, cardSource, error, reset: resetCard } = useCard()
  const scoredForRoundRef = useRef(false)
  const roundStartTimeRef = useRef<number>(0)
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
      resetCard()
    }
  }, [gamePhase, state.rounds.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gamePhase === 'ROUND_ACTIVE' && card) {
      roundStartTimeRef.current = Date.now()
    }
  }, [gamePhase, card])

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
      toast.error('Failed to load card. Please try again.')
    }
  }, [error, mode])

  useEffect(() => {
    if (gamePhase === 'ROUND_ACTIVE' && state.selectedMode && !card && !isPending && !error) {
      generateCard({ ...cardOptions, mode: state.selectedMode })
    }
  }, [gamePhase, state.selectedMode, card, isPending, error]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const roundDurationMs = roundStartTimeRef.current > 0 ? Date.now() - roundStartTimeRef.current : undefined
    dispatch({
      type: 'SCORE_ROUND',
      payload: {
        teamName: currentTeam.name,
        mode,
        card,
        pointsEarned: points,
        timestamp: new Date().toISOString(),
        usedCardKey: normalizeCardKey(card),
        cardSource: cardSource ?? undefined,
        roundDurationMs,
        skipped: false,
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
      className={cn('min-h-screen bg-parchment py-6 px-4 sm:px-6 font-sans relative overflow-x-hidden')}
    >
      {/* Background Ambience from Home Page */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent" />
        <motion.img
          src="/assets/sun_light_effect_overlay.png"
          alt=""
          aria-hidden="true"
          animate={prefersReducedMotion ? {} : { opacity: [0.25, 0.4, 0.25], scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="max-w-[150%] sm:max-w-[120%] opacity-30 mix-blend-soft-light"
        />
      </div>

      {showModeCompleteConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={150}
          />
        </div>
      )}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2">
            {gamePhase === 'MODE_SELECTED' && (
              <RoundSetConfig
                currentTeamName={currentTeam?.name ?? ''}
                remainingRounds={remainingRounds}
                onComplete={handleRoundSetComplete}
              />
            )}
            {gamePhase === 'MODE_COMPLETE' && state.selectedMode && (
              <Card className="p-8 space-y-6 bg-cream/90 backdrop-blur-md border-gold/20 shadow-xl shadow-mahogany/5">
                <div className="text-center space-y-4 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="flex justify-center"
                  >
                    <Sparkles className="h-14 w-14 text-gold drop-shadow-sm" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-mahogany">
                    {MODE_LABELS[state.selectedMode]} complete!
                  </h3>
                  <p className="text-warmBrown text-lg pb-4 max-w-sm">
                    You finished {state.totalRoundsForMode} rounds. Choose the next mode or end the game.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 w-full max-w-md">
                    <Button 
                      onClick={() => dispatch({ type: 'CLEAR_MODE_COMPLETE' })} 
                      variant="outline" 
                      className="w-full border-mahogany/30 text-mahogany hover:bg-mahogany/5 hover:text-mahogany font-semibold px-8 py-6 text-lg"
                    >
                      Next mode
                    </Button>
                    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full">
                      <Button 
                        onClick={handleEndGame} 
                        className="w-full relative group overflow-hidden px-8 py-6 text-lg shadow-xl shadow-amber-900/10 bg-gradient-to-b from-mahogany to-[#5A2E2A] border font-semibold border-gold text-cream transition-all duration-300 hover:shadow-amber-700/20 hover:shadow-2xl hover:border-amber-300"
                      >
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                        <Trophy className="h-5 w-5 mr-3" />
                        End game
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            )}
            {gamePhase === 'SHOW_RULES' && state.selectedMode && (
              <ModeRules mode={state.selectedMode} onDismiss={handleRulesDismiss} />
            )}
            {gamePhase === 'ROUND_ACTIVE' && (
              <>
                {error && !isPending ? (
                  <Card className="p-12 flex items-center justify-center min-h-[400px] bg-cream/90 backdrop-blur-md border-red-200/50 shadow-xl shadow-mahogany/5">
                    <div className="text-center space-y-4">
                      <p className="text-red-500 font-bold text-xl flex items-center justify-center gap-2">Failed to load card <Frown className="h-6 w-6" /></p>
                      <p className="text-warmBrown text-sm pb-4">The server may be busy. Try again in a moment.</p>
                      <Button
                        onClick={() => {
                          resetCard()
                          if (state.selectedMode) {
                            generateCard({ ...cardOptions, mode: state.selectedMode })
                          }
                        }}
                        className="bg-mahogany text-cream hover:bg-[#5A2E2A] px-8 py-6 text-lg font-semibold border border-gold/50 shadow-md"
                      >
                        Retry Connection
                      </Button>
                    </div>
                  </Card>
                ) : isPending || !card || !mode ? (
                  <Card className="p-12 flex items-center justify-center min-h-[400px] bg-cream/90 backdrop-blur-md border-gold/20 shadow-xl shadow-mahogany/5">
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
