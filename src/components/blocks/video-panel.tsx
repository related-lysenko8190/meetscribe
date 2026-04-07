import type { RefObject } from "react"
import { VideoPlayer } from "@/components/custom/video-player"
import type { TranscriptSegment } from "@/lib/types"

interface VideoPanelProps {
  videoUrl: string
  phase: string
  onTranscribe?: () => void
  onRetranscribe?: () => void
  onExportVideo?: () => void
  showSubtitles?: boolean
  onToggleSubtitles?: () => void
  onTimeUpdate?: (time: number) => void
  videoRef?: RefObject<HTMLVideoElement | null>
  segments?: TranscriptSegment[]
  activeSegmentId?: string
}

export function VideoPanel({
  videoUrl,
  onTimeUpdate,
  videoRef,
  showSubtitles,
  segments,
  activeSegmentId,
}: VideoPanelProps) {
  const activeText = showSubtitles
    ? segments?.find((s) => s.id === activeSegmentId)?.text
    : undefined

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-0 bg-ink">
        <VideoPlayer
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={onTimeUpdate}
          className="h-full w-full"
        />
        {activeText && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[80%] pointer-events-none">
            <span className="inline-block px-4 py-1.5 rounded bg-black/75 text-white text-sm leading-relaxed text-center">
              {activeText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
