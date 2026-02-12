"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { EventStatus } from "@/db/schema";

interface FilterBarProps {
  eventTypes: string[];
  coordinators: Array<{ id: number; name: string }>;
}

const STATUS_OPTIONS: { value: EventStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "completed", label: "Completed" },
];

export function FilterBar({ eventTypes, coordinators }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentEventType = searchParams.get("eventType") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentDateRangeParam = searchParams.get("dateRange") ?? "this_year";
  const currentDateRange =
    currentDateRangeParam === "this_month" || currentDateRangeParam === "this_year"
      ? currentDateRangeParam
      : "this_year";
  const currentCoordinatorId = searchParams.get("coordinatorId") ?? "";

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push("/");
    });
  }, [router]);

  const hasFilters =
    currentEventType || currentStatus || currentDateRange !== "this_year" || currentCoordinatorId;

  return (
    <div
      id="filter-panel"
      className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={currentCoordinatorId}
              onChange={(e) => updateFilters("coordinatorId", e.target.value)}
              className="h-11 min-w-[210px] appearance-none rounded-lg border border-zinc-300 bg-white px-3 pr-9 text-base text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">All Coordinators</option>
              <option value="unassigned">Unassigned</option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <DateRangePicker
            value={currentDateRange}
            onChange={(value) => updateFilters("dateRange", value)}
          />

          {eventTypes.length > 0 && (
            <div className="relative">
              <select
                value={currentEventType}
                onChange={(e) => updateFilters("eventType", e.target.value)}
                className="h-11 min-w-[170px] appearance-none rounded-lg border border-zinc-300 bg-white px-3 pr-9 text-base text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">All Event Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="h-11 min-w-[170px] appearance-none rounded-lg border border-zinc-300 bg-white px-3 pr-9 text-base text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
          {isPending && (
            <span className="text-base text-zinc-500 dark:text-zinc-400">Loading...</span>
          )}
        </div>
      </div>
    </div>
  );
}
