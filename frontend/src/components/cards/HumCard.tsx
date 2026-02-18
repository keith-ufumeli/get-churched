import { BaseCard } from './BaseCard'
import type { CardMode, CardResponse } from '@/types/game'

interface HumCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function HumCard({ card, mode, onScore }: HumCardProps) {
  const text = typeof card === 'string' ? card : String(card)

  return (
    <BaseCard card={card} mode={mode} onScore={onScore}>
      <p className="text-2xl font-serif text-center text-mahogany px-4">
        {text}
      </p>
    </BaseCard>
  )
}
