import { GoogleGenAI } from '@google/genai'

export interface GeminiTranscriptionResult {
  segments: Array<{
    speaker: string
    startTime: number
    endTime: number
    text: string
  }>
}

const TRANSCRIPTION_MAX_RETRIES = 3
const TRANSCRIPTION_RETRY_BASE_DELAY_MS = 1500
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

function stripCodeFences(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n')
    if (firstNewline !== -1) {
      cleaned = cleaned.slice(firstNewline + 1)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
  }
  return cleaned.trim()
}

function createClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseStatusCode(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null

  const maybeStatus = (err as { status?: unknown }).status
  if (typeof maybeStatus === 'number') return maybeStatus

  const maybeCauseStatus = (err as { cause?: { status?: unknown } }).cause?.status
  if (typeof maybeCauseStatus === 'number') return maybeCauseStatus

  const message = err instanceof Error ? err.message : String(err)
  const match = message.match(/\b(408|429|500|502|503|504)\b/)
  return match ? Number(match[1]) : null
}

function isRetryableGeminiError(err: unknown): boolean {
  const status = parseStatusCode(err)
  if (status !== null && RETRYABLE_STATUS_CODES.has(status)) return true

  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('temporarily unavailable') ||
    message.includes('service unavailable') ||
    message.includes('rate limit') ||
    message.includes('network')
  )
}

function humanizeGeminiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw)
    const inner = parsed?.error ?? parsed
    if (inner?.message) {
      const status = inner.code ? ` (${inner.code})` : ''
      return `${inner.message}${status}`
    }
  } catch {
    // not JSON -- fall through
  }
  if (raw.includes('503')) return 'Gemini is temporarily overloaded. Please try again in a moment.'
  if (raw.includes('429')) return 'Rate limit exceeded. Please wait a moment before retrying.'
  if (raw.includes('timeout') || raw.includes('timed out'))
    return 'The request timed out. The audio chunk may be too large for the model to process.'
  return raw
}

export async function transcribeAudio(
  apiKey: string,
  model: string,
  audioBlob: Blob,
  chunkStartTime: number
): Promise<GeminiTranscriptionResult> {
  const ai = createClient(apiKey)

  // Upload once, retry only the generateContent call
  let uploadedUri: string
  let uploadedMimeType: string
  try {
    const uploadedAudio = await ai.files.upload({
      file: audioBlob,
      config: {
        mimeType: audioBlob.type || 'audio/wav',
      },
    })
    if (!uploadedAudio.uri) {
      throw new Error('Gemini file upload succeeded but returned no file URI')
    }
    uploadedUri = uploadedAudio.uri
    uploadedMimeType = uploadedAudio.mimeType || audioBlob.type || 'audio/wav'
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Gemini file upload failed: ${humanizeGeminiError(msg)}`)
  }

  let response: { text?: string; promptFeedback?: { blockReason?: string } } | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= TRANSCRIPTION_MAX_RETRIES; attempt++) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: [
          {
            fileData: {
              mimeType: uploadedMimeType,
              fileUri: uploadedUri,
            },
          },
          {
            text: 'Transcribe this audio with speaker diarization. Return ONLY valid JSON (no markdown, no code fences) with format: {"segments": [{"speaker": "Speaker 1", "startTime": 0.0, "endTime": 5.2, "text": "..."}]}. Detect languages automatically (support English, Chinese, and mixed). Label speakers consistently as Speaker 1, Speaker 2, etc.',
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      })

      break
    } catch (err) {
      lastError = err
      const shouldRetry =
        attempt < TRANSCRIPTION_MAX_RETRIES && isRetryableGeminiError(err)
      if (!shouldRetry) break

      const delayMs = TRANSCRIPTION_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
      await sleep(delayMs)
    }
  }

  if (!response) {
    const msg =
      lastError instanceof Error ? lastError.message : String(lastError ?? 'Unknown error')
    throw new Error(`Gemini API error: ${humanizeGeminiError(msg)}`)
  }

  const rawText = response.text
  if (!rawText?.trim()) {
    const block = response.promptFeedback?.blockReason
    throw new Error(
      block
        ? `No transcription text (prompt blocked: ${block})`
        : 'No transcription text in Gemini response'
    )
  }

  const jsonText = stripCodeFences(rawText)

  let result: GeminiTranscriptionResult
  try {
    result = JSON.parse(jsonText) as GeminiTranscriptionResult
  } catch {
    throw new Error(
      `Failed to parse Gemini transcription JSON: ${jsonText.slice(0, 200)}`
    )
  }

  if (!Array.isArray(result.segments)) {
    throw new Error('Invalid transcription result: missing segments array')
  }

  result.segments = result.segments.map((seg) => ({
    ...seg,
    startTime: seg.startTime + chunkStartTime,
    endTime: seg.endTime + chunkStartTime,
  }))

  return result
}

export async function* streamChat(
  apiKey: string,
  model: string,
  transcriptContext: string,
  question: string
): AsyncGenerator<string> {
  const ai = createClient(apiKey)

  let stream: AsyncIterable<{ text?: string }>
  try {
    stream = await ai.models.generateContentStream({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: question }],
        },
      ],
      config: {
        systemInstruction: `You are analyzing a meeting transcript. Answer questions based on the content.\n\nTranscript:\n${transcriptContext}`,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Gemini chat API error: ${msg}`)
  }

  try {
    for await (const chunk of stream) {
      const text = chunk.text
      if (text) {
        yield text
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Gemini chat stream error: ${msg}`)
  }
}
