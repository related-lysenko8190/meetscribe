import { useState, useRef, useCallback, useEffect } from 'react'

interface UseCountdownOptions {
  startFrom?: number
  onComplete: () => void
}

interface UseCountdownReturn {
  count: number
  isActive: boolean
  start: () => void
  cancel: () => void
}

export function useCountdown({
  startFrom = 3,
  onComplete,
}: UseCountdownOptions): UseCountdownReturn {
  const [count, setCount] = useState(startFrom)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clearTimer()
    setCount(startFrom)
    setIsActive(true)

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearTimer()
          setIsActive(false)
          onCompleteRef.current()
          return 0
        }
        return next
      })
    }, 1000)
  }, [startFrom, clearTimer])

  const cancel = useCallback(() => {
    clearTimer()
    setIsActive(false)
    setCount(startFrom)
  }, [startFrom, clearTimer])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return { count, isActive, start, cancel }
}
