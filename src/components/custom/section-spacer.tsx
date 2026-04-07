import { cn } from "@/lib/utils"

interface SectionSpacerProps {
  size: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-[var(--spacing-section-sm)]",
  md: "h-[var(--spacing-section-md)]",
  lg: "h-[var(--spacing-section-lg)]",
}

export function SectionSpacer({ size }: SectionSpacerProps) {
  return <div className={cn(sizeClasses[size])} aria-hidden="true" />
}
