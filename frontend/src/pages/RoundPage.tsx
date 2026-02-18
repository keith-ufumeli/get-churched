import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { useCard } from '@/hooks/useCard'
import { ScoreBoard } from '@/components/game/ScoreBoard'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const GAME_MODES: CardMode[] = [
  'sing',
  'act',
  'explain',
  'trivia',
  'hum',
  'whoami',
  'fillinblank',
  'taboo',
  'oneword',
  'draw',
]

function getRandomMode(): CardMode {
  return GAME_MODES[Math.floor(Math.random() * GAME_MODES.length)]
}

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
  const [mode, setMode] = useState<CardMode | null>(null)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (state.status !== 'playing') {
      navigate('/setup')
      return
    }
    if (initialLoadDone.current) return
    initialLoadDone.current = true
    const randomMode = getRandomMode()
    const id = setTimeout(() => {
      setMode(randomMode)
      generateCard(randomMode)
    }, 0)
    return () => clearTimeout(id)
  }, [state.status, navigate, generateCard])

  useEffect(() => {
    if (error) {
      toast.error('Failed to load card. Using fallback card.')
      setTimeout(() => {
        generateCard(mode!)
      }, 1000)
    }
  }, [error, generateCard, mode])

  const handleScore = (points: number) => {
    if (!mode || !card) return

    const currentTeam = state.teams[state.currentTeamIndex]
    if (!currentTeam) return

    dispatch({
      type: 'SCORE_ROUND',
      payload: {
        teamName: currentTeam.name,
        mode,
        card: card,
        pointsEarned: points,
        timestamp: new Date().toISOString(),
      },
    })

    navigate('/result')
  }

  if (state.status !== 'playing') {
    return null
  }

  const currentTeam = state.teams[state.currentTeamIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('min-h-screen bg-parchment p-6 font-sans')}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-mahogany mb-2">
            {currentTeam?.name}'s Turn
          </h2>
          <p className="text-warmBrown">
            Round {state.rounds.length + 1} of {state.teams.length * state.roundsPerTeam}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isPending || !card || !mode ? (
              <Card className="p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-mahogany mx-auto" />
                  <p className="text-warmBrown">Loading card...</p>
                </div>
              </Card>
            ) : (
              <motion.div
                key={`${mode}-${String(card)}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardRenderer card={card} mode={mode} onScore={handleScore} />
              </motion.div>
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
