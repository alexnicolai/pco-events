import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "bg-bg-secondary text-text-primary hover:bg-bg-tertiary focus-visible:ring-accent",
  outline:
    "border border-border bg-bg-primary text-text-primary hover:bg-bg-hover focus-visible:ring-accent",
  ghost:
    "text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-accent",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-4 py-2 text-[15px]",
  sm: "h-9 px-3 py-2 text-sm",
  lg: "h-12 px-6 py-2 text-base",
  icon: "h-11 w-11",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
