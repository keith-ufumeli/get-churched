import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { TeamSetup } from '@/components/game/TeamSetup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Team, Difficulty } from '@/types/game'
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
]

const HYMN_COUNTRIES = [
  { value: '', label: 'Any' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Zimbabwe', label: 'Zimbabwe' },
]

type OnboardingStep = 'welcome' | 'teams' | 'rounds'

export function SetupPage() {
  const navigate = useNavigate()
  const { dispatch } = useGame()
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [teams, setTeams] = useState<Team[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [hymnCountry, setHymnCountry] = useState('')

  const handleAddTeam = (team: Team) => {
    setTeams([...teams, team])
  }

  const handleRemoveTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const handleStartGame = () => {
    if (teams.length < 2) return

    const sessionId = crypto.randomUUID()
    const teamsWithScores = teams.map((team) => ({ ...team, score: 0 }))

    dispatch({
      type: 'START_GAME',
      payload: {
        sessionId,
        teams: teamsWithScores,
        currentTeamIndex: 0,
        rounds: [],
        difficulty,
        hymnCountry,
      },
    })

    navigate('/round')
  }

  const nextStep = () => {
    if (step === 'welcome') setStep('teams')
    else if (step === 'teams' && teams.length >= 2) setStep('rounds')
  }

  const prevStep = () => {
    if (step === 'rounds') setStep('teams')
    else if (step === 'teams') setStep('welcome')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('min-h-screen bg-parchment p-6 font-sans')}
    >
      <div className="max-w-2xl mx-auto">
        {/* Step progress indicator */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2">
            {(['welcome', 'teams', 'rounds'] as OnboardingStep[]).map((s, index) => {
              const isActive = step === s
              const isPast =
                (s === 'welcome' && (step === 'teams' || step === 'rounds')) ||
                (s === 'teams' && step === 'rounds')
              return (
                <div key={s} className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      backgroundColor: isActive ? '#C9963A' : isPast ? '#6B3A2A' : '#D1C4B0',
                      scale: isActive ? 1.25 : 1,
                    }}
                    transition={{ duration: 0.25 }}
                    className="w-3 h-3 rounded-full"
                  />
                  {index < 2 && (
                    <motion.div
                      animate={{ backgroundColor: isPast ? '#6B3A2A' : '#D1C4B0' }}
                      transition={{ duration: 0.25 }}
                      className="w-10 h-px"
                    />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-sm text-warmBrown mt-3">
            Step {step === 'welcome' ? 1 : step === 'teams' ? 2 : 3} of 3
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center mb-4"
                >
                  <Sparkles className="h-12 w-12 text-gold" />
                </motion.div>
                <h1 className="text-3xl font-bold text-center text-mahogany">
                  Welcome to Get Churched!
                </h1>
                <div className="space-y-4 text-warmBrown">
                  <p className="text-lg">
                    A faith-based party game where teams compete in fun challenges.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Add at least 2 teams to get started</li>
                    <li>Each team takes turns playing different game modes</li>
                    <li>Earn points by completing challenges correctly</li>
                    <li>The team with the most points wins!</li>
                  </ul>
                </div>
                <Button onClick={nextStep} className="w-full" size="lg">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-mahogany">Set Up Teams</h2>
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                <TeamSetup
                  teams={teams}
                  onAddTeam={handleAddTeam}
                  onRemoveTeam={handleRemoveTeam}
                />
                {teams.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button onClick={nextStep} className="w-full" size="lg">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {step === 'rounds' && (
            <motion.div
              key="rounds"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-mahogany">Game Settings</h2>
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                <p className="text-warmBrown text-sm">
                  Number of rounds is chosen each time you start a set — after you pick a game mode.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-mahogany mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mahogany mb-2">
                      Hymn / Gospel region (optional)
                    </label>
                    <select
                      value={hymnCountry}
                      onChange={(e) => setHymnCountry(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {HYMN_COUNTRIES.map((opt) => (
                        <option key={opt.value || 'any'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-warmBrown mt-1">
                      Affects Hum a Hymn and song suggestions
                    </p>
                  </div>
                </div>
                <Button onClick={handleStartGame} className="w-full" size="lg">
                  Start Game!
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
