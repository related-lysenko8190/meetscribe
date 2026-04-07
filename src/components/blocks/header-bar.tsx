import { Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Pulse } from "@/components/animations/pulse"
import { cn, truncateApiKey } from "@/lib/utils"
import type { AppPhase } from "@/lib/types"

interface HeaderBarProps {
  phase: AppPhase
  apiKey: string
  onOpenSettings: () => void
}

function PhaseBadge({ phase }: { phase: AppPhase }) {
  switch (phase) {
    case "initial":
      return <Badge variant="outline">Ready</Badge>
    case "countdown":
      return <Badge variant="warning">Getting ready...</Badge>
    case "recording":
      return (
        <Badge variant="destructive" className="gap-1.5">
          <Pulse>
            <span className="size-1.5 rounded-full bg-on-error" />
          </Pulse>
          REC
        </Badge>
      )
    case "video_loaded":
      return <Badge variant="outline">Video loaded</Badge>
    case "processing":
      return <Badge variant="warning">Processing...</Badge>
    case "transcript_ready":
      return <Badge variant="success">Transcribed</Badge>
    default:
      return null
  }
}

export function HeaderBar({ phase, apiKey, onOpenSettings }: HeaderBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-ruler bg-surface">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#3B82F6]" />
          <span className="font-caveat text-2xl font-bold text-on-surface">
            MeetScribe
          </span>
        </div>
        <PhaseBadge phase={phase} />
      </div>
      <div className="flex items-center gap-3">
        {apiKey && (
          <span className={cn("font-mono text-xs text-graphite")}>
            {truncateApiKey(apiKey)}
          </span>
        )}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="flex items-center justify-center size-8 hover:bg-surface-container-low text-graphite hover:text-on-surface"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </header>
  )
}
