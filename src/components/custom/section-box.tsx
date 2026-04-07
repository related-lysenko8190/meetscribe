import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionBoxProps {
  label?: string
  children: ReactNode
  className?: string
}

export function SectionBox({ label, children, className }: SectionBoxProps) {
  return (
    <section className={cn("relative border border-graphite p-4", className)}>
      {label && (
        <span className="absolute -top-2.5 left-3 bg-surface px-2 text-xs font-label font-medium text-graphite">
          {label}
        </span>
      )}
      {children}
    </section>
  )
}
