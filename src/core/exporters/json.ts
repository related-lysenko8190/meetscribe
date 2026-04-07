import type { TranscriptSegment } from '@/lib/types'

export function toJSON(segments: TranscriptSegment[]): string {
  return JSON.stringify(segments, null, 2)
}
