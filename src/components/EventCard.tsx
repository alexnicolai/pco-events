import Link from "next/link";
import { CalendarIcon } from "@heroicons/react/24/outline";
import type { EventWithMeta } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedDate } from "./FormattedDate";

interface EventCardProps {
  event: EventWithMeta;
}

function coordinatorBadgeVariant(name: string): "pink" | "purple" | "secondary" {
  if (name.includes("Estera")) return "pink";
  if (name.includes("Bianca")) return "purple";
  return "secondary";
}

function coordinatorBadgeClassName(name: string): string {
  if (name.includes("Ministry")) {
    return "text-[14px] bg-bg-tertiary text-text-secondary";
  }
  return "text-[14px]";
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className="transition-colors hover:bg-bg-hover">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-text-primary">
              {event.title}
            </h3>
            {event.status === "not_contacted" && (
              <div className="flex shrink-0 flex-col items-end gap-1">
                {event.coordinatorName && (
                  <Badge
                    title={event.coordinatorName}
                    variant={coordinatorBadgeVariant(event.coordinatorName)}
                    className={coordinatorBadgeClassName(event.coordinatorName)}
                    style={{ padding: "6px 12px" }}
                  >
                    {event.coordinatorName}
                  </Badge>
                )}
                <Badge className="bg-yellow-100 text-yellow-800">Not Contacted</Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[14px] text-text-secondary">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="font-medium"><FormattedDate isoString={event.startAt} /></span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
