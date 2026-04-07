import {
  createContext,
  use,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
  type RefObject,
} from 'react'
import type { MediaState, MediaActions } from '@/lib/types'

interface MediaContextValue {
  state: MediaState
  actions: MediaActions
  videoRef: RefObject<HTMLVideoElement | null>
}

const MediaContext = createContext<MediaContextValue | null>(null)

export function MediaProvider({ children }: { children: ReactNode }) {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Revoke old URL when a new one is set
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  const setVideo = useCallback(
    (blob: Blob, name: string) => {
      // Revoke previous URL if any
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      const url = URL.createObjectURL(blob)
      setVideoBlob(blob)
      setVideoUrl(url)
      setFileName(name)
    },
    [videoUrl]
  )

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  const clear = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoBlob(null)
    setVideoUrl(null)
    setFileName(null)
  }, [videoUrl])

  const actions = useMemo<MediaActions>(
    () => ({ setVideo, seekTo, clear }),
    [setVideo, seekTo, clear]
  )

  const state: MediaState = { videoUrl, fileName, videoBlob }

  return (
    <MediaContext value={{ state, actions, videoRef }}>
      {children}
    </MediaContext>
  )
}

export function useMedia() {
  const context = use(MediaContext)
  if (!context) throw new Error('useMedia must be used within MediaProvider')
  return context
}
