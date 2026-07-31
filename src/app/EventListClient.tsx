"use client";

import { Header, FilterBar, EventCard, EmptyState } from "@/components";
import type { EventWithMeta } from "@/lib/queries";

interface EventListClientProps {
  events: EventWithMeta[];
  filterOptions: {
    eventTypes: string[];
    coordinators: Array<{ id: number; name: string }>;
  };
  lastSyncedAt?: string;
}

function groupEventsByMonth(events: EventWithMeta[]): Array<{ label: string; events: EventWithMeta[] }> {
  const groups = new Map<string, EventWithMeta[]>();
  for (const event of events) {
    const date = new Date(event.startAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("default", { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries()).map(([, evts]) => ({
    label: new Date(evts[0].startAt).toLocaleString("default", { month: "long", year: "numeric" }),
    events: evts,
  }));
}

export function EventListClient({ events, filterOptions, lastSyncedAt }: EventListClientProps) {
  const groups = groupEventsByMonth(events);

  return (
    <>
      <Header lastSyncedAt={lastSyncedAt} eventCount={events.length} />
      <FilterBar eventTypes={filterOptions.eventTypes} coordinators={filterOptions.coordinators} />
      <main className="mx-auto max-w-2xl px-4 py-3 sm:py-5">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {groups.map((group, i) => (
              <div key={group.label} className={i < groups.length - 1 ? "pb-6" : ""}>
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary" style={{ paddingBottom: "8px" }}>
                  {group.label}
                </h2>
                <div className="space-y-2.5 sm:space-y-3">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
