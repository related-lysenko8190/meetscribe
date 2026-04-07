import { Square } from "lucide-react"
import { RecordingIndicator } from "@/components/custom/recording-indicator"
import { StampButton } from "@/components/custom/stamp-button"

interface RecordingViewProps {
  duration: number
  onStop: () => void
}

export function RecordingView({ duration, onStop }: RecordingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <RecordingIndicator duration={duration} />
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center size-16 border-2 border-error">
          <Square className="size-6 text-error fill-error" />
        </div>
        <p className="text-sm font-body text-graphite">Recording screen...</p>
      </div>
      <StampButton variant="destructive" onClick={onStop}>
        Stop recording
      </StampButton>
    </div>
  )
}
