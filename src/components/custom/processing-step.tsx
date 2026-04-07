import { Check, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProcessingStep as ProcessingStepType } from "@/lib/types"

interface ProcessingStepProps {
  step: ProcessingStepType
}

export function ProcessingStep({ step }: ProcessingStepProps) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="flex shrink-0 items-center justify-center size-5">
        {step.status === "done" && (
          <Check className="size-4 text-green-700" />
        )}
        {step.status === "active" && (
          <Loader2 className="size-4 text-primary animate-spin" />
        )}
        {step.status === "pending" && (
          <Circle className="size-4 text-graphite" />
        )}
        {step.status === "error" && (
          <span className="size-4 text-error font-mono text-xs flex items-center justify-center">!</span>
        )}
      </span>
      <span
        className={cn(
          "text-sm font-label",
          step.status === "done" && "text-on-surface",
          step.status === "active" && "text-on-surface font-medium",
          step.status === "pending" && "text-graphite",
          step.status === "error" && "text-error"
        )}
      >
        {step.label}
      </span>
    </div>
  )
}
