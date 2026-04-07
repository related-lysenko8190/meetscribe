import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-label font-medium",
  {
    variants: {
      variant: {
        default: "bg-surface-container text-on-surface",
        primary: "bg-primary text-on-primary",
        secondary: "bg-secondary-container text-on-secondary-container",
        destructive: "bg-error text-on-error",
        outline: "border border-graphite text-on-surface",
        success: "bg-green-800 text-white",
        warning: "bg-primary-container text-on-primary-container",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
