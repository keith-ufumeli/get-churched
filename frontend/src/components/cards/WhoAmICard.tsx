import { BaseCard } from './BaseCard'
import type { CardMode, CardResponse } from '@/types/game'

interface WhoAmICardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function WhoAmICard({ card, mode, onScore }: WhoAmICardProps) {
  const text = typeof card === 'string' ? card : String(card)

  return (
    <BaseCard card={card} mode={mode} onScore={onScore}>
      <p className="text-3xl sm:text-4xl font-serif font-bold text-center text-mahogany tracking-tight px-4 leading-tight">
        {text}
      </p>
    </BaseCard>
  )
}
