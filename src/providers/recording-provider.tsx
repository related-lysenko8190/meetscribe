import {
  createContext,
  use,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import type { RecordingState, RecordingActions } from '@/lib/types'
import { startRecording, type RecorderHandle } from '@/core/recorder'

interface RecordingContextValue {
  state: RecordingState
  actions: RecordingActions
  /** The video blob after recording stops, null while recording or before */
  recordedBlob: Blob | null
}

const RecordingContext = createContext<RecordingContextValue | null>(null)

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const handleRef = useRef<RecorderHandle | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer: increment duration every second while recording
  useEffect(() => {
    if (isRecording) {
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (handleRef.current) {
        handleRef.current.stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const start = useCallback(async () => {
    setRecordedBlob(null)
    const handle = await startRecording()
    handleRef.current = handle
    setIsRecording(true)
  }, [])

  const stop = useCallback(() => {
    const handle = handleRef.current
    if (!handle) return

    setIsRecording(false)
    handleRef.current = null

    void handle.stop().then((blob) => {
      setRecordedBlob(blob)
    })
  }, [])

  const actions = useMemo<RecordingActions>(
    () => ({ start, stop }),
    [start, stop]
  )

  const state: RecordingState = { isRecording, duration }

  return (
    <RecordingContext value={{ state, actions, recordedBlob }}>
      {children}
    </RecordingContext>
  )
}

export function useRecording() {
  const context = use(RecordingContext)
  if (!context) throw new Error('useRecording must be used within RecordingProvider')
  return context
}
