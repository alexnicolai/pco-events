import * as React from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive";

const variants: Record<AlertVariant, string> = {
  default: "border-border-secondary bg-bg-secondary text-text-primary",
  destructive:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300",
};

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  return (
    <div
      role="alert"
      className={cn("rounded-2xl border px-3 py-3 text-sm", variants[variant], className)}
      {...props}
    />
  );
}
