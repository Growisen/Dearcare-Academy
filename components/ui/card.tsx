"use client"
import * as React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        rounded-2xl bg-gradient-to-br from-[#ebf4f5]/50 to-[#f7f5fa]/50
        border border-[#004d6d]/10
        shadow-[0_1px_3px_0_rgb(0,0,0,0.1)]
        transition-all duration-200 ease-in-out
        hover:shadow-[0_8px_16px_-6px_rgb(0,0,0,0.05)]
        hover:from-[#ebf4f5]/70 hover:to-[#f7f5fa]/70
        ${className}`}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
