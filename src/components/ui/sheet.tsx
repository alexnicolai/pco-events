"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

export function SheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-border-secondary bg-bg-card p-4",
        className
      )}
      {...props}
    />
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-text-primary", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-secondary", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sticky bottom-0 mt-4 flex gap-2 border-t border-divider bg-bg-card pt-3", className)} {...props} />;
}
