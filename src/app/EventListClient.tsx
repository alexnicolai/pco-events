"use client";

import { useState } from "react";
import { Header, FilterBar, EventCard, EmptyState } from "@/components";
import type { EventWithMeta } from "@/lib/queries";

interface EventListClientProps {
  events: EventWithMeta[];
  filterOptions: {
    eventTypes: string[];
  };
  lastSyncedAt?: string;
}

export function EventListClient({ events, filterOptions, lastSyncedAt }: EventListClientProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <Header
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        lastSyncedAt={lastSyncedAt}
      />
      <FilterBar
        eventTypes={filterOptions.eventTypes}
        visible={showFilters}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
