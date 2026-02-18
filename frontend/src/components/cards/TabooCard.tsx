import { BaseCard } from './BaseCard'
import { Badge } from '@/components/ui/badge'
import type { CardMode, CardResponse, TabooCard as TabooCardType } from '@/types/game'

interface TabooCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function TabooCard({ card, mode, onScore }: TabooCardProps) {
  const tabooCard = card as TabooCardType

  return (
    <BaseCard card={card} mode={mode} onScore={onScore}>
      <div className="w-full space-y-6">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-mahogany mb-6">
            {tabooCard.word}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-warmBrown font-medium">Don't say:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {tabooCard.forbidden.map((word, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-warmBrown border-warmBrown/30"
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
