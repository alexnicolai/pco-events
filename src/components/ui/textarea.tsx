import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-2xl border border-border bg-bg-primary px-3 py-3 text-[15px] text-text-primary",
        "placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
