import { Suspense } from "react";
import { getEvents, getFilterOptions, type EventFilters } from "@/lib/queries";
import { EVENT_STATUSES, type EventStatus } from "@/db/schema";
import { EventListClient } from "./EventListClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type DateRangeKey = "this_month" | "this_year";

function toIsoStartOfDay(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0)).toISOString();
}

function toIsoEndOfDay(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day, 23, 59, 59, 999)).toISOString();
}

function getDateRange(range: DateRangeKey): { startDate?: string; endDate?: string } {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  if (range === "this_month") {
    const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    return {
      startDate: toIsoStartOfDay(currentYear, currentMonth, 1),
      endDate: toIsoEndOfDay(currentYear, currentMonth, lastDayOfMonth),
    };
  }

  if (range === "this_year") {
    return {
      startDate: toIsoStartOfDay(currentYear, 0, 1),
      endDate: toIsoEndOfDay(currentYear, 11, 31),
    };
  }

  return {
    startDate: toIsoStartOfDay(currentYear, 0, 1),
    endDate: toIsoEndOfDay(currentYear, 11, 31),
  };
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateRangeParam = typeof params.dateRange === "string" ? params.dateRange : "this_year";
  const dateRange: DateRangeKey =
    dateRangeParam === "this_month" || dateRangeParam === "this_year"
      ? dateRangeParam
      : "this_year";
  const resolvedDateRange = getDateRange(dateRange);
  const parsedCoordinatorId =
    typeof params.coordinatorId === "string" && params.coordinatorId !== ""
      ? Number(params.coordinatorId)
      : undefined;
  const coordinatorFilter =
    params.coordinatorId === "unassigned"
      ? "unassigned"
      : parsedCoordinatorId !== undefined && Number.isInteger(parsedCoordinatorId)
        ? parsedCoordinatorId
        : undefined;

  const filters: EventFilters = {
    startDate: resolvedDateRange.startDate,
    endDate: resolvedDateRange.endDate,
    eventType: typeof params.eventType === "string" ? params.eventType : undefined,
    status:
      typeof params.status === "string" && EVENT_STATUSES.includes(params.status as EventStatus)
        ? (params.status as EventStatus)
        : undefined,
    coordinatorId: coordinatorFilter,
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
