import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950",
  secondary: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  success: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950",
  warning: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  outline: "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
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
