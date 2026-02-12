import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getCoordinators, getEventTimelineNotes } from "@/lib/queries";
import { EventDetailsSection } from "@/components/EventDetailsSection";
import { DetailClient } from "./DetailClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Updates = dynamic(() => import("@/components/Updates").then((mod) => mod.Updates), {
  loading: () => <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading updates...</p>,
});

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseJsonSafe<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:w-24 sm:shrink-0">
        {label}
      </span>
      <span className="text-base text-zinc-800 dark:text-zinc-200">{children}</span>
    </div>
  );
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [event, coordinators, timelineNotes] = await Promise.all([
    getEventById(id),
    getCoordinators(),
    getEventTimelineNotes(id),
  ]);

  if (!event) {
    notFound();
  }

  const rooms: string[] = parseJsonSafe(event.rooms, []);
  const hasContact = event.contactName || event.contactEmail || event.contactPhone || event.owner;
  const hasForm = Boolean(event.formUrl);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <Link href="/" aria-label="Back to events" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
          </Link>
          <h1 className="truncate text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">{event.title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-3 px-4 py-3 sm:py-5">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start gap-2">
              <CardTitle className="text-[18px] leading-tight">{event.title}</CardTitle>
              {event.eventType && <Badge variant="default">{event.eventType}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <DetailClient
              eventId={event.id}
              status={event.status}
              coordinatorId={event.coordinatorId}
              coordinators={coordinators}
            />
          </CardContent>
        </Card>

        <Section title="When">
          <Row label="Start">{formatDateTime(event.startAt)}</Row>
          {event.endAt && <Row label="End">{formatDateTime(event.endAt)}</Row>}
        </Section>

        {(event.campus || rooms.length > 0) && (
          <Section title="Where">
            {event.campus && <Row label="Campus">{event.campus}</Row>}
            {rooms.length > 0 && (
              <Row label="Rooms">
                <ul className="list-inside list-disc space-y-1">
                  {rooms.map((room, i) => (
                    <li key={i}>{room}</li>
                  ))}
                </ul>
              </Row>
            )}
          </Section>
        )}

        {hasContact && (
          <Section title="Who">
            {event.contactName && <Row label="Contact">{event.contactName}</Row>}
            {event.contactEmail && (
              <Row label="Email">
                <a href={`mailto:${event.contactEmail}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                  {event.contactEmail}
                </a>
              </Row>
            )}
            {event.contactPhone && (
              <Row label="Phone">
                <a href={`tel:${event.contactPhone}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                  {event.contactPhone}
                </a>
              </Row>
            )}
            {event.owner && <Row label="Owner">{event.owner}</Row>}
          </Section>
        )}

        {hasForm && (
          <Section title="Form Submission">
            <a
              href={event.formUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-zinc-900 hover:underline dark:text-zinc-100"
            >
              View submitted form in Planning Center
            </a>
          </Section>
        )}

        <EventDetailsSection
          eventId={event.id}
          setupNotes={event.setupNotes}
          estimatedAttendance={event.estimatedAttendance}
          eventLocationsJson={event.eventLocations}
          additionalComments={event.additionalComments}
        />

        <Section title="Updates">
          <Updates eventId={event.id} initialNotes={timelineNotes} />
        </Section>
      </main>
    </div>
  );
}
