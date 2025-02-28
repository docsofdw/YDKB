// src/components/common/ui/input.tsx
import * as React from "react"
import { cn } from "@/app/lib/utils"

// This interface extends the base HTML input attributes to allow for future extensions
// while maintaining type safety for all standard input properties
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Custom properties can be added here as needed
  variant?: 'default' | 'error';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variant === 'error' && "border-penalty-red",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }