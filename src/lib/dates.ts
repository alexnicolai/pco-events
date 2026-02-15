/**
 * Shared date formatting utilities for consistent EST timezone display.
 *
 * PCO may return ISO strings with or without timezone info.
 * `new Date()` treats timezone-less strings as LOCAL time, which differs
 * between the server (UTC) and the browser (user's TZ). We normalise by
 * appending "Z" when no offset is present so parsing is always UTC-based,
 * then `toLocaleString` with `timeZone` converts to Eastern.
 */

const TZ = "America/New_York";

/**
 * Parse an ISO date string, treating timezone-less values as UTC.
 */
function parseDate(iso: string): Date {
  // Already has "Z" or a +/-HH:MM offset → parse as-is
  if (/Z$|[+-]\d{2}:\d{2}$/.test(iso)) {
    return new Date(iso);
  }
  // No timezone info → treat as UTC to get consistent behaviour everywhere
  return new Date(iso + "Z");
}

export type DateVariant = "short" | "long";

const SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: TZ,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

const LONG_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: TZ,
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

/**
 * Format an ISO date string to a human-readable Eastern-time string.
 *
 * Works identically on the server (Node / Vercel) and in the browser.
 */
export function formatEventDate(iso: string, variant: DateVariant = "short"): string {
  const date = parseDate(iso);
  const options = variant === "long" ? LONG_OPTIONS : SHORT_OPTIONS;
  return date.toLocaleString("en-US", options);
}
