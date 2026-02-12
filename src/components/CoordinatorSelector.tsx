"use client";

import { useState } from "react";
import type { Coordinator } from "@/db/schema";
import { SelectField } from "@/components/ui/select-field";

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
    <SelectField
      value={coordinatorId ?? ""}
      onChange={handleChange}
      className="min-w-48"
      aria-label="Coordinator"
    >
      <option value="">Unassigned</option>
      {coordinators.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </SelectField>
  );
}
