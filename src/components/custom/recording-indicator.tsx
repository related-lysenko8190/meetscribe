import { Pulse } from "@/components/animations/pulse"
import { formatTime } from "@/lib/utils"

interface RecordingIndicatorProps {
  duration: number
}

export function RecordingIndicator({ duration }: RecordingIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Pulse>
        <span className="size-2.5 rounded-full bg-error" />
      </Pulse>
      <span className="text-sm font-mono font-bold text-error">REC</span>
      <span className="text-sm font-mono text-on-surface">
        {formatTime(duration)}
      </span>
    </div>
  )
}
