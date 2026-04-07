import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PulseProps {
  className?: string
  children?: ReactNode
}

export function Pulse({ className, children }: PulseProps) {
  return (
    <span className={cn("inline-flex animate-pulse", className)}>
      {children}
    </span>
  )
}
