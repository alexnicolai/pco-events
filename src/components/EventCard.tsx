import Link from "next/link";
import type { EventWithMeta } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "./StatusPill";

interface EventCardProps {
  event: EventWithMeta;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function coordinatorBadgeVariant(name: string): "secondary" | "outline" {
  if (name === "Bianca Nicolai" || name === "Estera Groza") {
    return "secondary";
  }
  return "outline";
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className="transition-colors hover:bg-bg-hover">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-text-primary">
              {event.title}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {event.coordinatorName && (
                <Badge
                  title={event.coordinatorName}
                  variant={coordinatorBadgeVariant(event.coordinatorName)}
                  className="max-w-28 truncate"
                >
                  {event.coordinatorName}
                </Badge>
              )}
              <StatusPill status={event.status} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            <svg
              className="h-4 w-4 shrink-0"
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
        </CardContent>
      </Card>
    </Link>
  );
}
