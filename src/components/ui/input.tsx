import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full border border-graphite bg-transparent px-3 py-1 text-sm font-body text-on-surface",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-graphite",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
