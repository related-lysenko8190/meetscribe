import type { TranscriptSegment } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { streamChat } from './gemini-client'

export function formatTranscriptForChat(segments: TranscriptSegment[]): string {
  return segments
    .map((seg) => `[${seg.speaker}] (${formatTime(seg.startTime)}) ${seg.text}`)
    .join('\n')
}

export async function* chatWithTranscript(
  apiKey: string,
  model: string,
  segments: TranscriptSegment[],
  question: string
): AsyncGenerator<string> {
  const transcriptContext = formatTranscriptForChat(segments)
  yield* streamChat(apiKey, model, transcriptContext, question)
}
