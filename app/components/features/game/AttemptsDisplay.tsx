// src/components/features/game/AttemptsDisplay.tsx
"use client"

import { Alert, AlertTitle } from "@/app/components/common/ui/alert"
import { cn } from "@/lib/utils"

interface AttemptsDisplayProps {
  attempts: string[]
  maxAttempts?: number
}

export function AttemptsDisplay({ attempts, maxAttempts = 3 }: AttemptsDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {Array.from({ length: maxAttempts }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-3 w-12 rounded-full",
              index < attempts.length
                ? "bg-destructive"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      {attempts.length > 0 && (
        <Alert>
          <AlertTitle>Previous guesses: {attempts.join(", ")}</AlertTitle>
        </Alert>
      )}
    </div>
  )
}