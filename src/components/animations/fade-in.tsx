import * as React from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  delay?: number
  duration?: number
  children: React.ReactNode
  className?: string
}

export function FadeIn({ delay = 0, duration = 200, children, className }: FadeInProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn("transition-opacity", className)}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
