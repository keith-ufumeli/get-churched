import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Production-grade animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring', bounce: 0.3, duration: 0.6 } 
  }
}

export function HomePage() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-parchment font-sans"
    >
      {/* 1. Background Implementation */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        {/* Soft radial CSS glow to support the PNG */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent" />
        {/* Sun overlay asset */}
        <motion.img
          src="/assets/sun_light_effect_overlay.png"
          alt=""
          aria-hidden="true"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="max-w-[150%] sm:max-w-full opacity-40 mix-blend-soft-light"
        />
      </div>

      {/* 2. Interactive Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl text-center">
        
        {/* Logo */}
        <motion.div variants={itemFadeUp} className="mb-4">
          <img
            src="/logos/get-churched-logo.png"
            alt="Get Churched"
            className="w-full h-auto max-w-[280px] sm:max-w-md drop-shadow-xl"
            style={{ willChange: 'transform' }}
          />
        </motion.div>

        {/* Subheading - Emotional Enhancer */}
        <motion.div variants={itemFadeUp} className="mb-12 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600/70" />
          <p className="text-mahogany/80 font-medium text-lg sm:text-xl tracking-wide">
            Gather. Rejoice. Connect.
          </p>
          <Sparkles className="w-4 h-4 text-amber-600/70" />
        </motion.div>

        {/* CTAs */}
        <motion.div 
          variants={itemFadeUp} 
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate('/setup')}
              className={cn(
                "relative group overflow-hidden w-full sm:w-auto px-8 py-7 text-lg shadow-xl shadow-amber-900/10",
                "bg-gradient-to-b from-mahogany to-[#5A2E2A] border font-semibold border-gold text-cream transition-all duration-300",
                "hover:shadow-amber-700/30 hover:shadow-2xl hover:border-amber-300"
              )}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              <Play className="w-5 h-5 mr-2 fill-current opacity-90" />
              Start Game
            </Button>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate('/scoreboard')}
              variant="outline"
              className={cn(
                "w-full sm:w-auto px-8 py-7 text-lg shadow-md font-semibold bg-cream/80 backdrop-blur-sm",
                "border-mahogany/30 text-mahogany transition-all duration-300",
                "hover:bg-cream hover:border-mahogany hover:shadow-lg"
              )}
            >
              <Trophy className="w-5 h-5 mr-2 opacity-80" />
              View Leaderboard
            </Button>
          </motion.div>
        </motion.div>
        
      </div>
    </motion.div>
  )
}
