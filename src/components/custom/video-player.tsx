import * as React from "react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  className?: string
}

export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer({ src, onTimeUpdate, className }, ref) {
    function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
      onTimeUpdate?.(e.currentTarget.currentTime)
    }

    return (
      <video
        ref={ref}
        src={src}
        controls
        onTimeUpdate={handleTimeUpdate}
        className={cn("w-full h-full bg-ink object-contain", className)}
      />
    )
  }
)
