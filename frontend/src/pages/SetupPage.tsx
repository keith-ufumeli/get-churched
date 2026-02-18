import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SetupPage() {
  return (
    <div className={cn('min-h-screen bg-parchment p-6 font-sans')}>
      <h1 className="text-2xl font-semibold text-mahogany mb-4">Setup</h1>
      <p className="text-warmBrown mb-6">Coming soon.</p>
      <Button asChild variant="outline" className="border-mahogany text-mahogany">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}
