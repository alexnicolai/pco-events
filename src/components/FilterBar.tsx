"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SelectField } from "@/components/ui/select-field";
import type { EventStatus } from "@/db/schema";

interface FilterBarProps {
  eventTypes: string[];
  coordinators: Array<{ id: number; name: string }>;
}

const STATUS_OPTIONS: { value: EventStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
];

type DateRange = "this_month" | "this_year";

type DraftFilters = {
  coordinatorId: string;
  dateRange: DateRange;
  eventType: string;
  status: string;
};

export function FilterBar({ eventTypes, coordinators }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const current = useMemo<DraftFilters>(() => {
    const dateRangeParam = searchParams.get("dateRange");
    const dateRange: DateRange = dateRangeParam === "this_month" ? "this_month" : "this_year";

    return {
      coordinatorId: searchParams.get("coordinatorId") ?? "",
      dateRange,
      eventType: searchParams.get("eventType") ?? "",
      status: searchParams.get("status") ?? "",
    };
  }, [searchParams]);

  const [draft, setDraft] = useState<DraftFilters>(current);

  const activeFilterCount = Number(Boolean(current.coordinatorId)) +
    Number(current.dateRange !== "this_year") +
    Number(Boolean(current.eventType)) +
    Number(Boolean(current.status));

  const syncDraftWithCurrent = useCallback(() => {
    setDraft(current);
  }, [current]);

  const applyDraft = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    const values: DraftFilters = {
      coordinatorId: draft.coordinatorId,
      dateRange: draft.dateRange,
      eventType: draft.eventType,
      status: draft.status,
    };

    if (values.coordinatorId) params.set("coordinatorId", values.coordinatorId);
    else params.delete("coordinatorId");

    if (values.dateRange !== "this_year") params.set("dateRange", values.dateRange);
    else params.delete("dateRange");

    if (values.eventType) params.set("eventType", values.eventType);
    else params.delete("eventType");

    if (values.status) params.set("status", values.status);
    else params.delete("status");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : "/");
      setOpen(false);
    });
  }, [draft, router, searchParams]);

  const clearDraft = useCallback(() => {
    setDraft({
      coordinatorId: "",
      dateRange: "this_year",
      eventType: "",
      status: "",
    });
  }, []);

  return (
    <div className="border-b border-divider bg-bg-primary px-4 py-2.5">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <Button
          variant="outline"
          className="w-full justify-between sm:w-auto"
          onClick={() => {
            syncDraftWithCurrent();
            setOpen(true);
          }}
          aria-controls="filter-panel"
          aria-expanded={open}
        >
          <span>Filters</span>
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
        {isPending && <span className="text-sm text-text-secondary">Loading...</span>}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent id="filter-panel">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-bg-tertiary" />
          <SheetHeader>
            <SheetTitle>Filter Events</SheetTitle>
            <SheetDescription>Apply filters to narrow your event list.</SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="coordinator-filter">Coordinator</Label>
              <SelectField
                id="coordinator-filter"
                value={draft.coordinatorId}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, coordinatorId: event.target.value }))
                }
              >
                <option value="">All Coordinators</option>
                <option value="unassigned">Unassigned</option>
                {coordinators.map((coordinator) => (
                  <option key={coordinator.id} value={coordinator.id}>
                    {coordinator.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date-range-filter">Date Range</Label>
              <SelectField
                id="date-range-filter"
                value={draft.dateRange}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, dateRange: event.target.value as DateRange }))
                }
              >
                <option value="this_month">This month</option>
                <option value="this_year">This year</option>
              </SelectField>
            </div>

            {eventTypes.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="event-type-filter">Event Type</Label>
                <SelectField
                  id="event-type-filter"
                  value={draft.eventType}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, eventType: event.target.value }))
                  }
                >
                  <option value="">All Event Types</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </SelectField>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="status-filter">Status</Label>
              <SelectField
                id="status-filter"
                value={draft.status}
                onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" className="flex-1" onClick={clearDraft}>
              Clear
            </Button>
            <Button className="flex-1" onClick={applyDraft} disabled={isPending}>
              Apply
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
