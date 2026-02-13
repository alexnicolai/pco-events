import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-border bg-bg-primary px-3 text-[15px] text-text-primary",
          "placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
