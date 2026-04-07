import type { TranscriptSegment, ProcessingProgress, ProcessingStep } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { extractAudio } from './audio-extractor'
import { chunkAudio } from './audio-chunker'
import { transcribeAudio } from './gemini-client'

export interface TranscriptionCallbacks {
  onProgress: (progress: ProcessingProgress) => void
  onComplete: (segments: TranscriptSegment[]) => void
  onError: (error: Error) => void
}

function createSteps(totalChunks: number): ProcessingStep[] {
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
    { id: 'diarize', label: 'Speaker diarization', status: 'pending' },
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

  // Sort by start time
  const sorted = [...rawSegments].sort((a, b) => a.startTime - b.startTime)

  const result: RawSegment[] = []

  for (const seg of sorted) {
    // Check if this segment overlaps significantly with an already-kept segment
    const duplicate = result.find(
      (existing) =>
        Math.abs(existing.startTime - seg.startTime) < 2 &&
        Math.abs(existing.endTime - seg.endTime) < 2 &&
        existing.speaker === seg.speaker
    )

    if (duplicate) {
      // For overlapping segments, prefer the one where the timestamp
      // is further from the chunk edge (more reliable)
      const dupDistFromEdge = Math.min(
        duplicate.startTime - duplicate.chunkStartTime,
        duplicate.chunkStartTime + duplicate.chunkDuration - duplicate.endTime
      )
      const segDistFromEdge = Math.min(
        seg.startTime - seg.chunkStartTime,
        seg.chunkStartTime + seg.chunkDuration - seg.endTime
      )

      if (segDistFromEdge > dupDistFromEdge) {
        // Replace with the better segment
        const idx = result.indexOf(duplicate)
        result[idx] = seg
      }
      // Otherwise keep the existing one
    } else {
      // Check if this segment falls in an overlap region and might be a
      // near-duplicate of another segment (looser text matching)
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
  apiKey: string,
  model: string,
  callbacks: TranscriptionCallbacks
): Promise<void> {
  // We'll build the steps incrementally once we know chunk count
  let steps: ProcessingStep[] = createSteps(1) // placeholder

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
    // Step 1: Extract audio
    steps = updateStep(steps, 'extract', 'active')
    emitProgress(0, 0)

    const wavBlob = await extractAudio(videoBlob)

    steps = updateStep(steps, 'extract', 'done')
    emitProgress(0, 0)

    // Step 2: Chunk audio
    steps = updateStep(steps, 'chunk', 'active')
    emitProgress(0, 0)

    const chunks = await chunkAudio(wavBlob)

    steps = updateStep(steps, 'chunk', 'done')

    // Now rebuild steps with correct chunk count
    steps = createSteps(chunks.length)
    steps = updateStep(steps, 'extract', 'done')
    steps = updateStep(steps, 'chunk', 'done')
    emitProgress(0, chunks.length)

    // Step 3: Transcribe each chunk
    const allRawSegments: RawSegment[] = []
    const chunkTimes: number[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const stepId = `transcribe-${i}`
      steps = updateStep(steps, stepId, 'active')

      // Estimate time remaining based on average chunk processing time
      const avgTime =
        chunkTimes.length > 0
          ? chunkTimes.reduce((a, b) => a + b, 0) / chunkTimes.length
          : null
      const remaining =
        avgTime !== null ? Math.round(avgTime * (chunks.length - i)) : null

      emitProgress(i + 1, chunks.length, remaining)

      const startTime = Date.now()
      const result = await transcribeAudio(apiKey, model, chunk.blob, chunk.startTime)
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

    // Step 4: Speaker diarization / deduplication
    steps = updateStep(steps, 'diarize', 'active')
    emitProgress(chunks.length, chunks.length)

    const deduped = deduplicateSegments(allRawSegments, 30)

    steps = updateStep(steps, 'diarize', 'done')

    // Step 5: Finalize
    steps = updateStep(steps, 'finalize', 'active')
    emitProgress(chunks.length, chunks.length)

    // Build speaker index map
    const speakerMap = new Map<string, number>()
    let nextIndex = 0
    for (const seg of deduped) {
      if (!speakerMap.has(seg.speaker)) {
        speakerMap.set(seg.speaker, nextIndex++)
      }
    }

    // Sort by start time and create final segments
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

    callbacks.onComplete(sortedSegments)
  } catch (err) {
    callbacks.onError(
      err instanceof Error ? err : new Error(String(err))
    )
  }
}
