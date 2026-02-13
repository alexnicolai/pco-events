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
    activeClass: "bg-bg-secondary text-text-primary",
  },
  {
    value: "contacted",
    label: "Contacted",
    activeClass: "bg-bg-tertiary text-text-primary",
  },
  {
    value: "completed",
    label: "Completed",
    activeClass: "bg-accent text-white",
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
              : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
