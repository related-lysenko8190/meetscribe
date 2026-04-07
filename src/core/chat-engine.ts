import type { TranscriptSegment, ServiceStack } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { streamChat } from './gemini-client'
import { streamOpenAIChat } from './openai-chat-client'

export interface ChatConfig {
  stack: ServiceStack
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  openaiChatModel: string
}

export function formatTranscriptForChat(segments: TranscriptSegment[]): string {
  return segments
    .map((seg) => `[${seg.speaker}] (${formatTime(seg.startTime)}) ${seg.text}`)
    .join('\n')
}

const SYSTEM_PREFIX =
  'You are analyzing a meeting transcript. Answer questions based on the content.\n\nTranscript:\n'

export async function* chatWithTranscript(
  config: ChatConfig,
  segments: TranscriptSegment[],
  question: string
): AsyncGenerator<string> {
  const transcriptContext = formatTranscriptForChat(segments)

  if (config.stack === 'openai') {
    yield* streamOpenAIChat(
      config.openaiApiKey,
      config.openaiChatModel,
      SYSTEM_PREFIX + transcriptContext,
      question
    )
  } else {
    yield* streamChat(
      config.geminiApiKey,
      config.geminiModel,
      transcriptContext,
      question
    )
  }
}
