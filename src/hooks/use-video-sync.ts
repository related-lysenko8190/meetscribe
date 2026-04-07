import { useMemo } from 'react'
import type { TranscriptSegment } from '@/lib/types'

export function useVideoSync(
  segments: TranscriptSegment[],
  currentTime: number
): string | null {
  return useMemo(() => {
    if (segments.length === 0) return null

    // Binary search for the segment containing currentTime
    let low = 0
    let high = segments.length - 1
    let result: string | null = null

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const seg = segments[mid]

      if (currentTime >= seg.startTime && currentTime < seg.endTime) {
        result = seg.id
        break
      } else if (currentTime < seg.startTime) {
        high = mid - 1
      } else {
        low = mid + 1
      }
    }

    // If binary search didn't find exact match, do a linear scan
    // (segments may not be perfectly contiguous)
    if (result === null) {
      for (const seg of segments) {
        if (currentTime >= seg.startTime && currentTime < seg.endTime) {
          return seg.id
        }
      }
    }

    return result
  }, [segments, currentTime])
}
