import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getCoordinators } from "@/lib/queries";
import { DetailClient } from "./DetailClient";

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
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-800 dark:text-zinc-200">{children}</span>
    </div>
  );
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [event, coordinators] = await Promise.all([
    getEventById(id),
    getCoordinators(),
  ]);

  if (!event) {
    notFound();
  }

  const rooms: string[] = parseJsonSafe(event.rooms, []);
  const formFields: Record<string, string> = parseJsonSafe(event.formFields, {});
  const formSubmissions = event.formSubmissions ?? [];
  const hasContact = event.contactName || event.contactEmail || event.contactPhone || event.owner;
  const hasForm =
    event.formUrl || Object.keys(formFields).length > 0 || formSubmissions.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Back to events"
          >
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
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {event.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {/* Header: title + interactive status & coordinator controls */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-3 mb-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {event.title}
            </h2>
            {event.eventType && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-300/20">
                {event.eventType}
              </span>
            )}
          </div>
          <DetailClient
            eventId={event.id}
            status={event.status}
            coordinatorId={event.coordinatorId}
            coordinators={coordinators}
          />
        </div>

        {/* When */}
        <Section title="When">
          <Row label="Start">{formatDateTime(event.startAt)}</Row>
          {event.endAt && <Row label="End">{formatDateTime(event.endAt)}</Row>}
        </Section>

        {/* Where */}
        {(event.campus || rooms.length > 0) && (
          <Section title="Where">
            {event.campus && <Row label="Campus">{event.campus}</Row>}
            {rooms.length > 0 && (
              <Row label="Rooms">
                <ul className="list-disc list-inside">
                  {rooms.map((room, i) => (
                    <li key={i}>{room}</li>
                  ))}
                </ul>
              </Row>
            )}
          </Section>
        )}

        {/* Who */}
        {hasContact && (
          <Section title="Who">
            {event.contactName && <Row label="Contact">{event.contactName}</Row>}
            {event.contactEmail && (
              <Row label="Email">
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {event.contactEmail}
                </a>
              </Row>
            )}
            {event.contactPhone && (
              <Row label="Phone">
                <a
                  href={`tel:${event.contactPhone}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {event.contactPhone}
                </a>
              </Row>
            )}
            {event.owner && <Row label="Owner">{event.owner}</Row>}
          </Section>
        )}

        {/* Form Submission */}
        {hasForm && (
          <Section title="Form Submission">
            {event.formUrl && (
              <a
                href={event.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
              >
                View in Planning Center
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H9.75A2.25 2.25 0 007.5 8.25v8.25a2.25 2.25 0 002.25 2.25h8.25A2.25 2.25 0 0120.25 16.5V12.75"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h6m0 0v6m0-6L10 13"
                  />
                </svg>
              </a>
            )}
            {formSubmissions.length > 0 && (
              <div className={`space-y-4 ${event.formUrl ? "mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800" : ""}`}>
                {formSubmissions.map((submission, index) => {
                  const responses = parseJsonSafe<
                    Array<{ label: string; value: string }> | Record<string, string>
                  >(submission.responses, {});
                  const responseEntries = Array.isArray(responses)
                    ? responses.map((response) => [response.label, response.value])
                    : Object.entries(responses);

                  return (
                    <div key={`${submission.submissionId}-${index}`} className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Submission {index + 1}
                      </div>
                      {(submission.submitterName || submission.submitterEmail || submission.submittedAt) && (
                        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {submission.submitterName && <div>{submission.submitterName}</div>}
                          {submission.submitterEmail && (
                            <div>
                              <a
                                href={`mailto:${submission.submitterEmail}`}
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {submission.submitterEmail}
                              </a>
                            </div>
                          )}
                          {submission.submittedAt && (
                            <div>{formatDateTime(submission.submittedAt)}</div>
                          )}
                        </div>
                      )}
                      {responseEntries.length > 0 ? (
                        <div className="space-y-2">
                          {responseEntries.map(([key, value]) => (
                            <div key={`${submission.submissionId}-${key}`}>
                              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                {key}
                              </dt>
                              <dd className="text-sm text-zinc-800 dark:text-zinc-200">
                                {value}
                              </dd>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          No form responses found.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {Object.keys(formFields).length > 0 && formSubmissions.length === 0 && (
              <div className={`space-y-2 ${event.formUrl ? "mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800" : ""}`}>
                {Object.entries(formFields).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{key}</dt>
                    <dd className="text-sm text-zinc-800 dark:text-zinc-200">{value}</dd>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </main>
    </div>
  );
}
