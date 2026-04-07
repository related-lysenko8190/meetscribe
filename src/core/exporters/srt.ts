import type { TranscriptSegment } from '@/lib/types'

function formatSrtTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)

  return (
    String(h).padStart(2, '0') +
    ':' +
    String(m).padStart(2, '0') +
    ':' +
    String(s).padStart(2, '0') +
    ',' +
    String(ms).padStart(3, '0')
  )
}

export function toSRT(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, index) => {
      const num = index + 1
      const start = formatSrtTimestamp(seg.startTime)
      const end = formatSrtTimestamp(seg.endTime)
      return `${num}\n${start} --> ${end}\n[${seg.speaker}] ${seg.text}`
    })
    .join('\n\n')
}
