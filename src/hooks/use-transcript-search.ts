import { useState, useEffect, useMemo } from 'react'
import type { TranscriptSegment } from '@/lib/types'

export function useTranscriptSearch(
  segments: TranscriptSegment[],
  query: string
): TranscriptSegment[] {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce the query with 300ms delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  return useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase()
    if (trimmed === '') return segments

    return segments.filter(
      (seg) =>
        seg.text.toLowerCase().includes(trimmed) ||
        seg.speaker.toLowerCase().includes(trimmed)
    )
  }, [segments, debouncedQuery])
}
