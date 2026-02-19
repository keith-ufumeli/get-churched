import type { CardResponse } from '@/types/game'

/**
 * Normalize a card to a stable string key for session used-cards tracking (O(1) lookup).
 */
export function normalizeCardKey(card: CardResponse): string {
  if (card == null) return ''
  if (typeof card === 'string') return card.trim().toLowerCase()
  return JSON.stringify(card).trim().toLowerCase()
}
