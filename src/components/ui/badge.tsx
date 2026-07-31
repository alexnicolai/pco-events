import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "pink" | "purple" | "blue";

const variants: Record<BadgeVariant, string> = {
  default: "bg-accent text-white",
  secondary: "bg-bg-secondary text-text-primary",
  success: "bg-tint-success-bg text-tint-success-fg",
  warning: "bg-tint-warning-bg text-tint-warning-fg",
  danger: "bg-tint-danger-bg text-tint-danger-fg",
  outline: "border border-border text-text-secondary",
  pink: "bg-tint-pink-bg text-tint-pink-fg",
  purple: "bg-tint-purple-bg text-tint-purple-fg",
  blue: "bg-tint-blue-bg text-tint-blue-fg",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
