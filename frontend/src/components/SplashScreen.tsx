import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SplashScreenProps {
  onComplete: () => void
  durationMs?: number
  logoSrc?: string
  className?: string
}

export function SplashScreen({
  onComplete,
  durationMs = 2800,
  logoSrc = '/logos/get-churched-logo.png',
  className,
}: SplashScreenProps) {
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    // Start logo reveal after a brief moment
    const startId = setTimeout(() => setReveal(true), 150)

    // Call onComplete when splash sequence is done
    const doneId = setTimeout(() => {
      onComplete()
    }, durationMs)

    return () => {
      clearTimeout(startId)
      clearTimeout(doneId)
    }
  }, [onComplete, durationMs])

  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-parchment',
        'font-sans',
        className
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Soft radial glow behind logo */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: reveal ? 0.4 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="w-[min(90vw,520px)] h-[min(60vw,320px)] rounded-full blur-3xl bg-gold/30"
          aria-hidden
        />
      </motion.div>

      {/* Logo container with clip-reveal and scale */}
      <div className="relative flex items-center justify-center w-full max-w-md px-8">
        <AnimatePresence mode="wait">
          {reveal && (
            <motion.div
              key="logo"
              initial={{
                opacity: 0,
                scale: 0.7,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 0.61, 0.36, 1],
              }}
              className="relative overflow-hidden"
            >
              <motion.img
                src={logoSrc}
                alt="Get Churched"
                className="relative z-10 w-full h-auto drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
              {/* Subtle shine overlay that fades in then out */}
              <motion.div
                className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  delay: 0.6,
                  duration: 0.8,
                  ease: 'easeInOut',
                }}
                aria-hidden
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optional tagline fade-in */}
      <motion.p
        className="absolute bottom-12 left-0 right-0 text-center text-warmBrown/80 text-sm font-medium"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: reveal ? 1 : 0, y: reveal ? 0 : 8 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Faith-based party game
      </motion.p>
    </motion.div>
  )
}
