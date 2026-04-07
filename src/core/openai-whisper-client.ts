import type { GeminiTranscriptionResult } from './gemini-client'

export const WHISPER_MAX_CHUNK_DURATION_SEC = 600

const OPENAI_TRANSCRIPTIONS_URL =
  'https://api.openai.com/v1/audio/transcriptions'

const SINGLE_SPEAKER = 'Speaker 1'

interface VerboseJsonSegment {
  start?: number
  end?: number
  text?: string
}

interface VerboseJsonResponse {
  duration?: number
  text?: string
  segments?: VerboseJsonSegment[]
}

export async function transcribeAudioWhisper(
  apiKey: string,
  model: string,
  audioBlob: Blob,
  chunkStartTime: number
): Promise<GeminiTranscriptionResult> {
  const form = new FormData()
  form.append('model', model)
  form.append('response_format', 'verbose_json')
  form.append(
    'file',
    new File([audioBlob], 'audio.wav', { type: 'audio/wav' })
  )

  let res: Response
  try {
    res = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Whisper request failed (network/CORS). Ensure the app is served over HTTPS or use a backend proxy. ${msg}`
    )
  }

  const rawBody = await res.text()

  if (!res.ok) {
    let detail = rawBody.slice(0, 500)
    try {
      const j = JSON.parse(rawBody) as { error?: { message?: string } }
      if (j.error?.message) detail = j.error.message
    } catch {
      // keep raw text
    }
    throw new Error(`OpenAI Whisper API error (${res.status}): ${detail}`)
  }

  let data: VerboseJsonResponse
  try {
    data = JSON.parse(rawBody) as VerboseJsonResponse
  } catch {
    throw new Error(`Whisper: expected JSON, got: ${rawBody.slice(0, 120)}`)
  }

  const segmentsIn = data.segments
  if (Array.isArray(segmentsIn) && segmentsIn.length > 0) {
    const segments = segmentsIn
      .map((s) => ({
        speaker: SINGLE_SPEAKER,
        startTime: Number(s.start ?? 0) + chunkStartTime,
        endTime: Number(s.end ?? 0) + chunkStartTime,
        text: String(s.text ?? '').trim(),
      }))
      .filter((s) => s.text.length > 0)

    if (segments.length > 0) return { segments }
  }

  const fullText = String(data.text ?? '').trim()
  if (fullText) {
    const dur = typeof data.duration === 'number' ? data.duration : 0
    return {
      segments: [
        {
          speaker: SINGLE_SPEAKER,
          startTime: chunkStartTime,
          endTime: chunkStartTime + dur,
          text: fullText,
        },
      ],
    }
  }

  throw new Error('Whisper returned no transcript segments or text')
}
