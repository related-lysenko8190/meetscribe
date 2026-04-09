import type { TranscriptSegment, ProcessingProgress, ProcessingStep, ServiceStack } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { extractAudio } from './audio-extractor'
import { chunkAudio } from './audio-chunker'
import { transcribeAudio } from './gemini-client'
import { transcribeAudioWhisper, WHISPER_MAX_CHUNK_DURATION_SEC } from './openai-whisper-client'

const GEMINI_MAX_CHUNK_DURATION_SEC = 300

export interface TranscriptionConfig {
  stack: ServiceStack
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  whisperModel: string
}

export interface TranscriptionCallbacks {
  onProgress: (progress: ProcessingProgress) => void
  onComplete: (segments: TranscriptSegment[]) => void
  onError: (error: Error) => void
}

function createSteps(totalChunks: number, isWhisper: boolean): ProcessingStep[] {
  const steps: ProcessingStep[] = [
    { id: 'extract', label: 'Extracting audio', status: 'pending' },
    { id: 'chunk', label: 'Splitting into chunks', status: 'pending' },
  ]

  for (let i = 0; i < totalChunks; i++) {
    steps.push({
      id: `transcribe-${i}`,
      label: `Transcribing chunk ${i + 1}/${totalChunks}`,
      status: 'pending',
    })
  }

  steps.push(
    { id: 'diarize', label: isWhisper ? 'Merging transcript' : 'Speaker diarization', status: 'pending' },
    { id: 'finalize', label: 'Finalizing transcript', status: 'pending' }
  )

  return steps
}

function updateStep(
  steps: ProcessingStep[],
  stepId: string,
  status: ProcessingStep['status']
): ProcessingStep[] {
  return steps.map((s) => (s.id === stepId ? { ...s, status } : s))
}

interface RawSegment {
  speaker: string
  startTime: number
  endTime: number
  text: string
  chunkIndex: number
  chunkStartTime: number
  chunkDuration: number
}

function deduplicateSegments(
  rawSegments: RawSegment[],
  overlapSec: number
): RawSegment[] {
  if (rawSegments.length === 0) return []

  const sorted = [...rawSegments].sort((a, b) => a.startTime - b.startTime)

  const result: RawSegment[] = []

  for (const seg of sorted) {
    const duplicate = result.find(
      (existing) =>
        Math.abs(existing.startTime - seg.startTime) < 2 &&
        Math.abs(existing.endTime - seg.endTime) < 2 &&
        existing.speaker === seg.speaker
    )

    if (duplicate) {
      const dupDistFromEdge = Math.min(
        duplicate.startTime - duplicate.chunkStartTime,
        duplicate.chunkStartTime + duplicate.chunkDuration - duplicate.endTime
      )
      const segDistFromEdge = Math.min(
        seg.startTime - seg.chunkStartTime,
        seg.chunkStartTime + seg.chunkDuration - seg.endTime
      )

      if (segDistFromEdge > dupDistFromEdge) {
        const idx = result.indexOf(duplicate)
        result[idx] = seg
      }
    } else {
      const isInOverlap = result.some(
        (existing) =>
          existing.chunkIndex !== seg.chunkIndex &&
          Math.abs(existing.startTime - seg.startTime) < overlapSec &&
          existing.text.trim() === seg.text.trim()
      )

      if (!isInOverlap) {
        result.push(seg)
      }
    }
  }

  return result
}

export async function runTranscription(
  videoBlob: Blob,
  config: TranscriptionConfig,
  callbacks: TranscriptionCallbacks
): Promise<void> {
  const isWhisper = config.stack === 'openai'
  let steps: ProcessingStep[] = createSteps(1, isWhisper)
  let activeStepId: string | null = null

  const emitProgress = (
    currentChunk: number,
    totalChunks: number,
    estimatedTimeRemaining: number | null = null
  ) => {
    callbacks.onProgress({
      steps: [...steps],
      currentChunk,
      totalChunks,
      estimatedTimeRemaining,
    })
  }

  try {
    activeStepId = 'extract'
    steps = updateStep(steps, 'extract', 'active')
    emitProgress(0, 0)

    const wavBlob = await extractAudio(videoBlob)

    steps = updateStep(steps, 'extract', 'done')
    emitProgress(0, 0)

    activeStepId = 'chunk'
    steps = updateStep(steps, 'chunk', 'active')
    emitProgress(0, 0)

    const maxDuration = isWhisper ? WHISPER_MAX_CHUNK_DURATION_SEC : GEMINI_MAX_CHUNK_DURATION_SEC
    const chunks = await chunkAudio(wavBlob, maxDuration)

    steps = updateStep(steps, 'chunk', 'done')

    steps = createSteps(chunks.length, isWhisper)
    steps = updateStep(steps, 'extract', 'done')
    steps = updateStep(steps, 'chunk', 'done')
    emitProgress(0, chunks.length)

    const allRawSegments: RawSegment[] = []
    const chunkTimes: number[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const stepId = `transcribe-${i}`
      activeStepId = stepId
      steps = updateStep(steps, stepId, 'active')

      const avgTime =
        chunkTimes.length > 0
          ? chunkTimes.reduce((a, b) => a + b, 0) / chunkTimes.length
          : null
      const remaining =
        avgTime !== null ? Math.round(avgTime * (chunks.length - i)) : null

      emitProgress(i + 1, chunks.length, remaining)

      const startTime = Date.now()

      const result = isWhisper
        ? await transcribeAudioWhisper(config.openaiApiKey, config.whisperModel, chunk.blob, chunk.startTime)
        : await transcribeAudio(config.geminiApiKey, config.geminiModel, chunk.blob, chunk.startTime)

      const elapsed = (Date.now() - startTime) / 1000
      chunkTimes.push(elapsed)

      for (const seg of result.segments) {
        allRawSegments.push({
          ...seg,
          chunkIndex: i,
          chunkStartTime: chunk.startTime,
          chunkDuration: chunk.duration,
        })
      }

      steps = updateStep(steps, stepId, 'done')
      emitProgress(i + 1, chunks.length)
    }

    activeStepId = 'diarize'
    steps = updateStep(steps, 'diarize', 'active')
    emitProgress(chunks.length, chunks.length)

    const deduped = deduplicateSegments(allRawSegments, 30)

    steps = updateStep(steps, 'diarize', 'done')

    activeStepId = 'finalize'
    steps = updateStep(steps, 'finalize', 'active')
    emitProgress(chunks.length, chunks.length)

    const speakerMap = new Map<string, number>()
    let nextIndex = 0
    for (const seg of deduped) {
      if (!speakerMap.has(seg.speaker)) {
        speakerMap.set(seg.speaker, nextIndex++)
      }
    }

    const sortedSegments = deduped
      .sort((a, b) => a.startTime - b.startTime)
      .map(
        (seg): TranscriptSegment => ({
          id: generateId(),
          speaker: seg.speaker,
          speakerIndex: speakerMap.get(seg.speaker) ?? 0,
          startTime: seg.startTime,
          endTime: seg.endTime,
          text: seg.text,
        })
      )

    steps = updateStep(steps, 'finalize', 'done')
    emitProgress(chunks.length, chunks.length)
    activeStepId = null

    callbacks.onComplete(sortedSegments)
  } catch (err) {
    if (activeStepId) {
      steps = updateStep(steps, activeStepId, 'error')
      callbacks.onProgress({
        steps: [...steps],
        currentChunk: 0,
        totalChunks: steps.filter((step) => step.id.startsWith('transcribe-')).length,
        estimatedTimeRemaining: null,
      })
    }
    callbacks.onError(
      err instanceof Error ? err : new Error(String(err))
    )
  }
}
