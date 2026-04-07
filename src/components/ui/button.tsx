import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container",
        outline:
          "border-ink bg-transparent text-on-surface hover:bg-surface-container-low",
        secondary:
          "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
        ghost:
          "hover:bg-surface-container-low hover:text-on-surface",
        destructive:
          "bg-error text-on-error hover:bg-error/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-4 py-2",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1 px-3 text-sm",
        lg: "h-10 gap-2 px-6 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
