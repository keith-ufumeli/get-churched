import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { TeamSetup } from '@/components/game/TeamSetup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Team, Difficulty } from '@/types/game'
import { ArrowRight, ArrowLeft, Sparkles, Play } from 'lucide-react'

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

interface PrimaryButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

const PrimaryButton = ({ onClick, children, className, icon: Icon = ArrowRight, disabled = false }: PrimaryButtonProps) => (
  <motion.div whileHover={disabled ? {} : { scale: 1.02, y: -2 }} whileTap={disabled ? {} : { scale: 0.98 }}>
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative group overflow-hidden w-full px-8 py-6 text-lg shadow-xl shadow-amber-900/10",
        "bg-gradient-to-b from-mahogany to-[#5A2E2A] border font-semibold border-gold text-cream transition-all duration-300",
        !disabled && "hover:shadow-amber-700/20 hover:shadow-2xl hover:border-amber-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {!disabled && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
      )}
      {children}
      <Icon className="w-5 h-5 ml-2 fill-current opacity-90" />
    </Button>
  </motion.div>
)

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', bounce: 0.3, duration: 0.6 }
  },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
}

export function SetupPage() {
  const navigate = useNavigate()
  const { dispatch } = useGame()
  const prefersReducedMotion = useReducedMotion()
  
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [teams, setTeams] = useState<Team[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [hymnCountry, setHymnCountry] = useState('')

  const handleAddTeam = (team: Team) => setTeams([...teams, team])
  const handleRemoveTeam = (index: number) => setTeams(teams.filter((_, i) => i !== index))

  const handleStartGame = () => {
    if (teams.length < 2) return

    const sessionId = crypto.randomUUID()
    const teamsWithScores = teams.map((team) => ({ ...team, score: 0 }))

    dispatch({
      type: 'START_GAME',
      payload: { sessionId, teams: teamsWithScores, currentTeamIndex: 0, rounds: [], difficulty, hymnCountry },
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
    <div className={cn('relative min-h-screen py-12 px-6 flex items-center justify-center overflow-x-hidden bg-parchment font-sans')}>
      
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

      <div className="relative z-10 w-full max-w-xl mx-auto">
        
        {/* Step Progress Indicator */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2">
            {(['welcome', 'teams', 'rounds'] as OnboardingStep[]).map((s, index) => {
              const isActive = step === s
              const isPast = (s === 'welcome' && step !== 'welcome') || (s === 'teams' && step === 'rounds')
              
              return (
                <div key={s} className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      backgroundColor: isActive ? '#C9963A' : isPast ? '#6B3A2A' : '#D1C4B0',
                      scale: isActive ? 1.3 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-3 h-3 rounded-full shadow-inner"
                  />
                  {index < 2 && (
                    <div className="w-12 h-1 bg-[#D1C4B0]/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isPast ? '100%' : '0%' }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="h-full bg-[#6B3A2A]"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <motion.p 
            key={step}
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-warmBrown/70 mt-4 uppercase tracking-widest"
          >
            Step {step === 'welcome' ? 1 : step === 'teams' ? 2 : 3} of 3
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: WELCOME */}
          {step === 'welcome' && (
            <motion.div key="welcome" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="p-8 sm:p-10 space-y-8 bg-cream/90 backdrop-blur-md border-gold/20 shadow-2xl shadow-mahogany/5">
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="h-14 w-14 text-gold drop-shadow-sm" />
                  </motion.div>
                </div>
                
                <div className="text-center space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-mahogany">
                    Welcome to Get Churched!
                  </h1>
                  <p className="text-lg text-warmBrown/90">
                    A faith-based party game where teams compete in fun challenges.
                  </p>
                </div>

                <div className="bg-white/50 p-6 rounded-xl border border-mahogany/5 text-warmBrown">
                  <ul className="space-y-3 list-none">
                    {[
                      "Add at least 2 teams to get started",
                      "Each team takes turns playing different game modes",
                      "Earn points by completing challenges correctly",
                      "The team with the most points wins!"
                    ].map((item, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-gold mt-1">•</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <PrimaryButton onClick={nextStep}>Get Started</PrimaryButton>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: TEAMS */}
          {step === 'teams' && (
            <motion.div key="teams" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="p-8 sm:p-10 space-y-8 bg-cream/90 backdrop-blur-md border-gold/20 shadow-2xl shadow-mahogany/5">
                <div className="flex items-center justify-between pb-4 border-b border-mahogany/10">
                  <h2 className="text-2xl font-bold text-mahogany">Set Up Teams</h2>
                  <Button variant="ghost" onClick={prevStep} className="text-warmBrown hover:bg-mahogany/5 hover:text-mahogany transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                
                <TeamSetup teams={teams} onAddTeam={handleAddTeam} onRemoveTeam={handleRemoveTeam} />
                
                <AnimatePresence>
                  {teams.length >= 2 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <PrimaryButton onClick={nextStep} className="mt-4">Continue</PrimaryButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: ROUNDS & SETTINGS */}
          {step === 'rounds' && (
            <motion.div key="rounds" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="p-8 sm:p-10 space-y-8 bg-cream/90 backdrop-blur-md border-gold/20 shadow-2xl shadow-mahogany/5">
                <div className="flex items-center justify-between pb-4 border-b border-mahogany/10">
                  <h2 className="text-2xl font-bold text-mahogany">Game Settings</h2>
                  <Button variant="ghost" onClick={prevStep} className="text-warmBrown hover:bg-mahogany/5 hover:text-mahogany transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
                  <p className="text-warmBrown/90 text-sm text-center">
                    Number of rounds is chosen each time you start a set — after you pick a game mode.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-mahogany">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full rounded-xl border border-mahogany/20 bg-white/70 backdrop-blur-sm px-4 py-3 text-mahogany ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all shadow-sm"
                    >
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="block text-sm font-semibold text-mahogany">
                        Hymn / Gospel Region
                      </label>
                      <span className="text-xs text-warmBrown/60 uppercase font-medium">Optional</span>
                    </div>
                    <select
                      value={hymnCountry}
                      onChange={(e) => setHymnCountry(e.target.value)}
                      className="w-full rounded-xl border border-mahogany/20 bg-white/70 backdrop-blur-sm px-4 py-3 text-mahogany ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all shadow-sm"
                    >
                      {HYMN_COUNTRIES.map((opt) => (
                        <option key={opt.value || 'any'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-warmBrown/70 mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-gold" />
                      Affects <i>Hum a Hymn</i> and song suggestions
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <PrimaryButton onClick={handleStartGame} icon={Play}>
                    Start Game
                  </PrimaryButton>
                </div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
