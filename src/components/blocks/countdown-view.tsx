import { CountdownDisplay } from "@/components/custom/countdown-display"
import { StampButton } from "@/components/custom/stamp-button"

interface CountdownViewProps {
  count: number
  onCancel: () => void
}

export function CountdownView({ count, onCancel }: CountdownViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <CountdownDisplay count={count} />
      <StampButton variant="secondary" onClick={onCancel}>
        Cancel
      </StampButton>
    </div>
  )
}
