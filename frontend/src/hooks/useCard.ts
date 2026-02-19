import { useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generateCard, type GenerateCardOptions } from '@/lib/api'
import type { CardResponse, CardSource } from '@/types/game'

const MAX_RETRIES = 3

function retryDelay(attempt: number) {
  return Math.min(2000 * Math.pow(2, attempt), 15000)
}

function shouldRetry(failureCount: number, error: Error) {
  if (failureCount >= MAX_RETRIES) return false
  const status = (error as Error & { response?: { status?: number } })?.response?.status
  if (status === 429) return failureCount < 2
  return true
}

interface UseCardReturn {
  generate: (options: GenerateCardOptions) => void
  isPending: boolean
  card: CardResponse | null
  cardSource: CardSource | null
  error: Error | null
  reset: () => void
}

export function useCard(): UseCardReturn {
  const requestIdRef = useRef(0)

  const mutation = useMutation({
    mutationFn: generateCard,
    retry: shouldRetry,
    retryDelay,
  })

  const { mutate } = mutation
  const generate = useCallback(
    (options: GenerateCardOptions) => {
      requestIdRef.current += 1
      mutate(options)
    },
    [mutate]
  )

  const reset = useCallback(() => {
    requestIdRef.current += 1
    mutation.reset()
  }, [mutation])

  return {
    generate,
    isPending: mutation.isPending,
    card: mutation.data?.card ?? null,
    cardSource: mutation.data?.source ?? null,
    error: mutation.error,
    reset,
  }
}
