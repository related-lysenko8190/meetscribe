import { ProcessingStep } from "@/components/custom/processing-step"
import { ProgressBar } from "@/components/custom/progress-bar"
import { SectionBox } from "@/components/custom/section-box"
import { formatTime } from "@/lib/utils"
import type { ProcessingProgress } from "@/lib/types"

interface ProcessingPanelProps {
  progress: ProcessingProgress
}

export function ProcessingPanel({ progress }: ProcessingPanelProps) {
  const doneCount = progress.steps.filter((s) => s.status === "done").length
  const percent = progress.steps.length > 0
    ? Math.round((doneCount / progress.steps.length) * 100)
    : 0

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <SectionBox label="Processing progress">
        <div className="flex flex-col gap-3">
          {progress.steps.map((step) => (
            <ProcessingStep key={step.id} step={step} />
          ))}
        </div>
      </SectionBox>

      <div className="flex flex-col gap-2">
        <ProgressBar value={percent} />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-graphite">
            {progress.currentChunk} / {progress.totalChunks} chunks
          </span>
          {progress.estimatedTimeRemaining != null && (
            <span className="text-xs font-mono text-graphite">
              ~{formatTime(progress.estimatedTimeRemaining)} remaining
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
