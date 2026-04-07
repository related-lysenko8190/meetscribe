import { GoogleGenAI } from '@google/genai'

export interface GeminiTranscriptionResult {
  segments: Array<{
    speaker: string
    startTime: number
    endTime: number
    text: string
  }>
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j])
    }
  }
  return btoa(binary)
}

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

export async function transcribeAudio(
  apiKey: string,
  model: string,
  audioBlob: Blob,
  chunkStartTime: number
): Promise<GeminiTranscriptionResult> {
  const arrayBuffer = await audioBlob.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const base64Data = uint8ArrayToBase64(bytes)

  const ai = createClient(apiKey)

  let response
  try {
    response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Data,
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Gemini API error: ${msg}`)
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
