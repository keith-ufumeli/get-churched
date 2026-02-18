import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'min-h-screen bg-parchment flex flex-col items-center justify-center p-6',
        'font-sans'
      )}
    >
      <img
        src="/logos/get-churched-logo.png"
        alt="Get Churched"
        className="max-w-md w-full h-auto mb-10"
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => navigate('/setup')}
          className="bg-mahogany hover:bg-warmBrown text-cream border border-gold px-8 py-6 text-lg"
        >
          Start Game
        </Button>
        <Button
          onClick={() => navigate('/scoreboard')}
          variant="outline"
          className="border-mahogany text-mahogany hover:bg-cream px-8 py-6 text-lg"
        >
          View Leaderboard
        </Button>
      </div>
    </div>
  )
}
