import { cn, formatTime } from "@/lib/utils"
import { SpeakerBadge } from "./speaker-badge"
import type { TranscriptSegment as TranscriptSegmentType } from "@/lib/types"

interface TranscriptSegmentProps {
  segment: TranscriptSegmentType
  isActive?: boolean
  onClick?: () => void
}

export function TranscriptSegment({ segment, isActive, onClick }: TranscriptSegmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 w-full text-left px-3 py-2.5 border-l-2 border-transparent",
        "hover:bg-surface-container-low/50",
        isActive && "border-l-primary-container bg-surface-container-low/50"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <SpeakerBadge speaker={segment.speaker} speakerIndex={segment.speakerIndex} />
        <span className="text-[10px] font-mono text-graphite shrink-0">
          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
        </span>
      </div>
      <p className="text-sm font-body text-on-surface leading-relaxed">
        {segment.text}
      </p>
    </button>
  )
}
