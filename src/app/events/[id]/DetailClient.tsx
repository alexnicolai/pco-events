"use client";

import type { EventStatus, Coordinator } from "@/db/schema";
import { StatusSelector } from "@/components/StatusSelector";
import { CoordinatorSelector } from "@/components/CoordinatorSelector";

interface DetailClientProps {
  eventId: string;
  status: EventStatus;
  coordinatorId: number | null;
  coordinators: Coordinator[];
}

export function DetailClient({
  eventId,
  status,
  coordinatorId,
  coordinators,
}: DetailClientProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <StatusSelector eventId={eventId} currentStatus={status} />
      <CoordinatorSelector
        eventId={eventId}
        currentCoordinatorId={coordinatorId}
        coordinators={coordinators}
      />
    </div>
  );
}
