"use client";

import { useState } from "react";
import type { EventStatus } from "@/db/schema";
import { SelectField } from "@/components/ui/select-field";

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
];

interface StatusSelectorProps {
  eventId: string;
  currentStatus: EventStatus;
}

export function StatusSelector({ eventId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState<EventStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(value: EventStatus) {
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
    <SelectField
      value={status}
      onChange={(e) => handleChange(e.target.value as EventStatus)}
      disabled={loading}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
}
