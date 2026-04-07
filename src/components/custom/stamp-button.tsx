import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StampButtonProps {
  variant: "primary" | "secondary" | "destructive"
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: ReactNode
  className?: string
  type?: "button" | "submit" | "reset"
}

const variantClasses = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container",
  secondary:
    "border border-ink bg-transparent text-on-surface hover:bg-surface-container-low",
  destructive:
    "bg-error text-on-error hover:bg-error/90",
}

export function StampButton({
  variant,
  children,
  onClick,
  disabled = false,
  icon,
  className,
  type = "button",
}: StampButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-label font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className
      )}
    >
      {icon && <span className="flex shrink-0 [&_svg]:size-4">{icon}</span>}
      {children}
    </button>
  )
}
