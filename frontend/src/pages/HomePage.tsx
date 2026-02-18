import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'min-h-screen bg-parchment flex flex-col items-center justify-center p-6',
        'font-sans'
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="mb-10"
      >
        <img
          src="/logos/get-churched-logo.png"
          alt="Get Churched"
          className="max-w-md w-full h-auto"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => navigate('/setup')}
            className="bg-mahogany hover:bg-warmBrown text-cream border border-gold px-8 py-6 text-lg shadow-lg"
          >
            Start Game
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => navigate('/scoreboard')}
            variant="outline"
            className="border-mahogany text-mahogany hover:bg-cream px-8 py-6 text-lg shadow-lg"
          >
            View Leaderboard
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
