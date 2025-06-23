import * as React from "react"
import { cn } from "@/lib/utils"

import { Checkbox as CheckboxPrimitive, type CheckboxProps } from "@radix-ui/react-checkbox"

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive>, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      {...props}
      ref={ref}
    />
  ),
)
Checkbox.displayName = CheckboxPrimitive.displayName

const CheckboxItem = Checkbox

export { CheckboxItem, Checkbox }
