import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "success";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "px-4 py-2 rounded-md font-medium";
    const variantStyles = {
      default: "bg-blue-500 text-white hover:bg-blue-600",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      success: "bg-green-500 text-white hover:bg-green-600"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
