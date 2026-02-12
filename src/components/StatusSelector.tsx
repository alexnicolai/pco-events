"use client";

import { useState } from "react";
import type { EventStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: {
  value: EventStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "not_contacted",
    label: "Not Contacted",
    activeClass: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
  },
  {
    value: "contacted",
    label: "Contacted",
    activeClass: "bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-950",
  },
  {
    value: "completed",
    label: "Completed",
    activeClass: "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950",
  },
];

interface StatusSelectorProps {
  eventId: string;
  currentStatus: EventStatus;
}

export function StatusSelector({ eventId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState<EventStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleSelect(value: EventStatus) {
    if (value === status || loading) return;
    const prev = status;
    setStatus(value);
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/meta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) setStatus(prev);
    } catch {
      setStatus(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          disabled={loading}
          variant="secondary"
          className={cn(
            "h-11 rounded-full px-4 text-sm",
            status === option.value
              ? option.activeClass
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
