import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "muted"
}

export function GlassCard({
  className,
  variant = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-effect rounded-xl",
        {
          "bg-background/80": variant === "default",
          "bg-destructive/80": variant === "destructive",
          "bg-muted/80": variant === "muted",
        },
        className
      )}
      {...props}
    />
  )
} 