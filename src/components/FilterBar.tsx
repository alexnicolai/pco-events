"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { EventStatus } from "@/db/schema";

interface FilterBarProps {
  eventTypes: string[];
  visible: boolean;
}

const STATUS_OPTIONS: { value: EventStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "completed", label: "Completed" },
];

export function FilterBar({ eventTypes, visible }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentEventType = searchParams.get("eventType") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentStartDate = searchParams.get("startDate") ?? "";
  const currentEndDate = searchParams.get("endDate") ?? "";

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

  const hasFilters = currentEventType || currentStatus || currentStartDate || currentEndDate;

  if (!visible) return null;

  return (
    <div
      id="filter-panel"
      className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <DateRangePicker
          startDate={currentStartDate}
          endDate={currentEndDate}
          onStartDateChange={(date) => updateFilters("startDate", date)}
          onEndDateChange={(date) => updateFilters("endDate", date)}
        />

        <div className="flex flex-wrap gap-3">
          {eventTypes.length > 0 && (
            <select
              value={currentEventType}
              onChange={(e) => updateFilters("eventType", e.target.value)}
              className="h-10 min-w-[140px] rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">All Event Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}

          <select
            value={currentStatus}
            onChange={(e) => updateFilters("status", e.target.value)}
            className="h-10 min-w-[140px] rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
          {isPending && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</span>
          )}
        </div>
      </div>
    </div>
  );
}
