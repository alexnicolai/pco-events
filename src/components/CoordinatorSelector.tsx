"use client";

import { useState } from "react";
import type { Coordinator } from "@/db/schema";

interface CoordinatorSelectorProps {
  eventId: string;
  currentCoordinatorId: number | null;
  coordinators: Coordinator[];
}

export function CoordinatorSelector({
  eventId,
  currentCoordinatorId,
  coordinators,
}: CoordinatorSelectorProps) {
  const [coordinatorId, setCoordinatorId] = useState<number | null>(currentCoordinatorId);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value === "" ? null : Number(e.target.value);
    const prev = coordinatorId;
    setCoordinatorId(value);
    try {
      const res = await fetch(`/api/events/${eventId}/meta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinatorId: value }),
      });
      if (!res.ok) setCoordinatorId(prev);
    } catch {
      setCoordinatorId(prev);
    }
  }

  return (
    <select
      value={coordinatorId ?? ""}
      onChange={handleChange}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
    >
      <option value="">Unassigned</option>
      {coordinators.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
