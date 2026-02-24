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
      <div className="space-y-4 text-center px-4">
        <p className="text-3xl sm:text-4xl font-serif font-bold text-mahogany tracking-tight leading-tight">{text}</p>
        <p className="text-base sm:text-lg text-warmBrown font-medium">Your song must contain this word.</p>
      </div>
    </BaseCard>
  )
}
