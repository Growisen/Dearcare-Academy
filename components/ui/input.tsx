"use client"
import * as React from "react"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-10 w-full rounded-md border border-gray-200 
          bg-white px-3 py-2 text-sm 
          placeholder:text-gray-500 
          focus:outline-none focus:ring-2 focus:ring-blue-500 
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
