import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { className, containerClassName, children, ...props },
  ref
) {
  return (
    <div className={cn("relative", containerClassName)}>
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-2xl border border-border bg-bg-primary px-3 pr-10 text-[15px] text-text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
});
