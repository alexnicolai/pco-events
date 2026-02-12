import Link from "next/link";
import { StatusPill } from "./StatusPill";
import type { EventWithMeta } from "@/lib/queries";

interface EventCardProps {
  event: EventWithMeta;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  // Format: "Mon, Feb 3, 7:30 PM"
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function coordinatorBadgeClass(name: string): string {
  if (name === "Bianca Nicolai") {
    return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300";
  }
  if (name === "Estera Groza") {
    return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
  }
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {event.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {event.coordinatorName && (
            <span
              title={event.coordinatorName}
              className={`inline-flex max-w-36 items-center rounded-full px-3 py-1 text-sm font-medium ${coordinatorBadgeClass(event.coordinatorName)}`}
            >
              <span className="truncate">{event.coordinatorName}</span>
            </span>
          )}
          <StatusPill status={event.status} />
        </div>
      </div>

      <div className="mt-4 space-y-2 text-base text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <span>{formatDateTime(event.startAt)}</span>
        </div>
      </div>
    </Link>
  );
}
