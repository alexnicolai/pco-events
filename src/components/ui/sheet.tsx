"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground
      snapPoints={[1]}
    >
      <Drawer.Portal>{children}</Drawer.Portal>
    </Drawer.Root>
  );
}

export function SheetContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <Drawer.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-border-secondary bg-bg-card p-4 outline-none",
          className
        )}
        {...props}
      >
        {children}
      </Drawer.Content>
    </>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Drawer.Title className={cn("text-lg font-semibold text-text-primary", className)} {...props} />
  );
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Drawer.Description className={cn("text-sm text-text-secondary", className)} {...props} />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sticky bottom-0 mt-4 flex gap-2 border-t border-divider bg-bg-card pt-3",
        className
      )}
      {...props}
    />
  );
}
