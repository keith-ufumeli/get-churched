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
          <h3 className="text-4xl sm:text-5xl font-bold font-serif text-mahogany mb-8 tracking-tight">
            {tabooCard.word}
          </h3>
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-warmBrown font-bold uppercase tracking-widest px-8 flex items-center gap-4">
              <span className="h-px bg-warmBrown/20 flex-1" />
              Don't say
              <span className="h-px bg-warmBrown/20 flex-1" />
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {tabooCard.forbidden.map((word, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-warmBrown border-warmBrown/30 text-base sm:text-lg px-4 py-1.5 bg-white/50"
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
