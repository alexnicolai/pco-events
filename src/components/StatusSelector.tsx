"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventStatus } from "@/db/schema";
import { SelectField } from "@/components/ui/select-field";

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "not_an_event", label: "Not an Event" },
];

interface StatusSelectorProps {
  eventId: string;
  currentStatus: EventStatus;
}

export function StatusSelector({ eventId, currentStatus }: StatusSelectorProps) {
  const router = useRouter();
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
      if (!res.ok) {
        setStatus(prev);
      } else {
        router.refresh();
      }
    } catch {
      setStatus(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SelectField
      label="Status"
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
