import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-accent text-white",
  secondary: "bg-bg-secondary text-text-primary",
  success: "bg-positive text-white",
  warning: "bg-warning text-text-inverse",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  outline: "border border-border text-text-secondary",
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
