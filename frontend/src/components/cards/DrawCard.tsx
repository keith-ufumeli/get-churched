import { useEffect, useRef } from 'react'
import { BaseCard } from './BaseCard'
import { Button } from '@/components/ui/button'
import { useCanvas } from '@/hooks/useCanvas'
import type { CardMode, CardResponse } from '@/types/game'
import { Eraser } from 'lucide-react'

interface DrawCardProps {
  card: CardResponse
  mode: CardMode
  onScore: (points: number) => void
}

export function DrawCard({ card, mode, onScore }: DrawCardProps) {
  const text = typeof card === 'string' ? card : String(card)
  const { canvasRef, clearCanvas } = useCanvas()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerRef.current) return

    const resizeCanvas = () => {
      const container = containerRef.current!
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = Math.min(rect.width * 0.75, 400)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [canvasRef])

  return (
    <BaseCard card={card} mode={mode} onScore={onScore}>
      <div className="w-full space-y-4">
        <p className="text-xl font-serif text-center text-mahogany px-4">
          {text}
        </p>

        <div
          ref={containerRef}
          className="w-full bg-white rounded-lg border-2 border-mahogany/20 overflow-hidden"
          style={{ aspectRatio: '4/3', maxHeight: '400px' }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none cursor-crosshair"
            style={{ display: 'block' }}
          />
        </div>

        <Button
          onClick={clearCanvas}
          variant="outline"
          className="w-full"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Clear Canvas
        </Button>
      </div>
    </BaseCard>
  )
}
