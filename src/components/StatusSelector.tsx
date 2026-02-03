"use client";

import { useState } from "react";
import type { EventStatus } from "@/db/schema";

const STATUS_OPTIONS: {
  value: EventStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "not_contacted",
    label: "Not Contacted",
    activeClass: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  },
  {
    value: "contacted",
    label: "Contacted",
    activeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    value: "completed",
    label: "Completed",
    activeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
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
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          disabled={loading}
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            status === option.value
              ? option.activeClass
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
