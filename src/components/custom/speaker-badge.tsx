import { getSpeakerColor } from "@/lib/utils"

interface SpeakerBadgeProps {
  speaker: string
  speakerIndex: number
}

export function SpeakerBadge({ speaker, speakerIndex }: SpeakerBadgeProps) {
  const color = getSpeakerColor(speakerIndex)

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono font-medium" style={{ color }}>
        {speaker}
      </span>
    </span>
  )
}
