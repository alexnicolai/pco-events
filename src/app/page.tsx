import { Suspense } from "react";
import { getEvents, getFilterOptions, type EventFilters } from "@/lib/queries";
import { EVENT_STATUSES, type EventStatus } from "@/db/schema";
import { EventListClient } from "./EventListClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: EventFilters = {
    startDate: typeof params.startDate === "string" ? params.startDate : undefined,
    endDate: typeof params.endDate === "string" ? params.endDate : undefined,
    eventType: typeof params.eventType === "string" ? params.eventType : undefined,
    status:
      typeof params.status === "string" && EVENT_STATUSES.includes(params.status as EventStatus)
        ? (params.status as EventStatus)
        : undefined,
  };

  const [events, filterOptions] = await Promise.all([
    getEvents(filters),
    getFilterOptions(),
  ]);

  const lastSyncedAt = events.length > 0 ? events[0].syncedAt : undefined;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Suspense fallback={null}>
        <EventListClient
          events={events}
          filterOptions={filterOptions}
          lastSyncedAt={lastSyncedAt}
        />
      </Suspense>
    </div>
  );
}
