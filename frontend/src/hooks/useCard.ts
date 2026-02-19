import { useMutation } from '@tanstack/react-query'
import { generateCard, type GenerateCardOptions } from '@/lib/api'
import type { CardResponse } from '@/types/game'

interface UseCardReturn {
  mutate: (options: GenerateCardOptions) => void
  isPending: boolean
  card: CardResponse | null
  error: Error | null
}

export function useCard(): UseCardReturn {
  const mutation = useMutation({
    mutationFn: generateCard,
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    card: mutation.data ?? null,
    error: mutation.error,
  }
}
