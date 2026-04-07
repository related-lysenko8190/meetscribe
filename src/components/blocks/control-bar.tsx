import { Download, FileText, Subtitles } from "lucide-react"
import { StampButton } from "@/components/custom/stamp-button"
import { Checkbox } from "@/components/ui/checkbox"
import type { AppPhase } from "@/lib/types"

interface ControlBarProps {
  phase: AppPhase
  onTranscribe?: () => void
  onRetranscribe?: () => void
  onExportVideo?: () => void
  onExportAll?: () => void
  showSubtitles?: boolean
  onToggleSubtitles?: () => void
  currentChunk?: number
  totalChunks?: number
}

export function ControlBar({
  phase,
  onTranscribe,
  onRetranscribe,
  onExportVideo,
  onExportAll,
  showSubtitles,
  onToggleSubtitles,
}: ControlBarProps) {
  return (
    <nav className="flex items-center justify-between gap-3 px-4 py-3 border-t border-ruler bg-surface">
      <div className="flex items-center gap-3">
        {phase === "video_loaded" && (
          <StampButton variant="primary" onClick={onTranscribe} icon={<FileText />}>
            Transcribe
          </StampButton>
        )}
        {phase === "transcript_ready" && (
          <>
            <StampButton variant="secondary" onClick={onRetranscribe} icon={<FileText />}>
              Retranscribe
            </StampButton>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={showSubtitles}
                onCheckedChange={() => onToggleSubtitles?.()}
              />
              <span className="text-xs font-label text-on-surface flex items-center gap-1">
                <Subtitles className="size-3.5" />
                Overlay subtitles
              </span>
            </label>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {(phase === "video_loaded" || phase === "transcript_ready") && (
          <StampButton variant="secondary" onClick={onExportVideo} icon={<Download />}>
            Export video
          </StampButton>
        )}
        {phase === "transcript_ready" && (
          <StampButton variant="primary" onClick={onExportAll} icon={<Download />}>
            Export all
          </StampButton>
        )}
      </div>
    </nav>
  )
}
