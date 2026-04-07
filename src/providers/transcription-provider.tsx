import {
  createContext,
  use,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  TranscriptSegment,
  ProcessingProgress,
  TranscriptionState,
  TranscriptionActions,
} from '@/lib/types'
import { useSettings } from './settings-provider'
import { useApp } from './app-provider'
import { runTranscription } from '@/core/transcription-engine'

interface TranscriptionContextValue {
  state: TranscriptionState
  actions: TranscriptionActions
}

const TranscriptionContext = createContext<TranscriptionContextValue | null>(null)

export function TranscriptionProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { state: settings } = useSettings()
  const { actions: appActions } = useApp()

  const transcribe = useCallback(
    async (videoBlob: Blob) => {
      if (!settings.apiKey) {
        setError('API key is required. Please set your Gemini API key in settings.')
        return
      }

      setIsProcessing(true)
      setError(null)
      setSegments([])
      setProgress(null)

      appActions.startProcessing()

      await runTranscription(videoBlob, settings.apiKey, settings.model, {
        onProgress: (p: ProcessingProgress) => {
          setProgress(p)
        },
        onComplete: (result: TranscriptSegment[]) => {
          setSegments(result)
          setIsProcessing(false)
          setProgress(null)
          appActions.finishProcessing()
        },
        onError: (err: Error) => {
          setError(err.message)
          setIsProcessing(false)
          setProgress(null)
        },
      })
    },
    [settings.apiKey, settings.model, appActions]
  )

  const actions = useMemo<TranscriptionActions>(
    () => ({ transcribe }),
    [transcribe]
  )

  const state: TranscriptionState = { segments, progress, isProcessing, error }

  return (
    <TranscriptionContext value={{ state, actions }}>
      {children}
    </TranscriptionContext>
  )
}

export function useTranscription() {
  const context = use(TranscriptionContext)
  if (!context)
    throw new Error(
      'useTranscription must be used within TranscriptionProvider'
    )
  return context
}
