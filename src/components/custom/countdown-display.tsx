import { cn } from "@/lib/utils"

interface CountdownDisplayProps {
  count: number
  className?: string
}

export function CountdownDisplay({ count, className }: CountdownDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      <div className="flex items-center justify-center size-32 border-2 border-primary-container">
        <span className="text-6xl font-headline font-bold text-primary-container">
          {count}
        </span>
      </div>
      <p className="text-base font-body text-graphite">
        Recording starts in {count}...
      </p>
    </div>
  )
}
