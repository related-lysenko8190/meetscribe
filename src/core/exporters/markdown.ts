import type { TranscriptSegment } from '@/lib/types'
import { formatTime } from '@/lib/utils'

export function toMarkdown(segments: TranscriptSegment[]): string {
  const lines = ['# Meeting Transcript', '']

  for (const seg of segments) {
    lines.push(`## ${seg.speaker} (${formatTime(seg.startTime)})`)
    lines.push(seg.text)
    lines.push('')
  }

  return lines.join('\n')
}
