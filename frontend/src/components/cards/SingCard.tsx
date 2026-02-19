import { BaseCard } from './BaseCard'
import type { CardMode, CardResponse } from '@/types/game'

interface SingCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function SingCard({ card, mode, onScore }: SingCardProps) {
  const text = typeof card === 'string' ? card : String(card)

  return (
    <BaseCard card={card} mode={mode} onScore={onScore}>
      <div className="space-y-2 text-center px-4">
        <p className="text-2xl font-serif text-mahogany">{text}</p>
        <p className="text-sm text-warmBrown">Your song must contain this word.</p>
      </div>
    </BaseCard>
  )
}
