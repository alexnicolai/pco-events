/**
 * Event synchronization logic
 * Syncs events from PCO Calendar to local Turso database
 */

import { eq, inArray, sql } from "drizzle-orm";
import { db, events, eventMeta, eventFormSubmissions } from "@/db";
import {
  fetchApprovedEvents,
  fetchEventRequestSubmissionsMap,
  fetchEventTags,
  fetchInstanceRooms,
} from "./pco";
import type { PcoEventRequestSubmission } from "./pco";
import { transformPcoEventInstance } from "./transform";
import { mapWithConcurrency } from "./utils";
import type { NewEvent, NewEventMeta } from "@/db/schema";

const EXCLUDED_EVENT_TYPES = new Set(["Practice", "Service"]);

// Overlap the incremental window by this much to absorb clock skew between
// this server and PCO. Re-fetched events upsert idempotently, so overlap is safe.
const INCREMENTAL_SAFETY_BUFFER_MS = 5 * 60 * 1000;

export type SyncMode = "full" | "incremental";

export interface SyncOptions {
  daysAhead?: number;
  mode?: SyncMode;
}

export interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  total: number;
  errors: string[];
  mode: SyncMode;
}

function pickMostRecentSubmission(
  submissions: PcoEventRequestSubmission[]
): PcoEventRequestSubmission | null {
  if (submissions.length === 0) return null;

  const submissionWithIndex = submissions.map((submission, index) => ({
    submission,
    index,
    timestamp: submission.submittedAt ? Date.parse(submission.submittedAt) : Number.NaN,
  }));

  submissionWithIndex.sort((a, b) => {
    const aValid = Number.isFinite(a.timestamp);
    const bValid = Number.isFinite(b.timestamp);
    if (aValid && bValid) return b.timestamp - a.timestamp;
    if (aValid) return -1;
    if (bValid) return 1;
    return b.index - a.index;
  });

  return submissionWithIndex[0].submission;
}

/**
 * Cursor for incremental sync: the most recent `syncedAt` in the events table,
 * less a safety buffer. Returns null when there is nothing synced yet.
 */
async function getIncrementalCursor(): Promise<string | null> {
  const rows = await db
    .select({ syncedAt: events.syncedAt })
    .from(events)
    .orderBy(sql`${events.syncedAt} DESC`)
    .limit(1);

  const last = rows[0]?.syncedAt;
  if (!last) return null;

  const parsed = Date.parse(last);
  if (Number.isNaN(parsed)) return null;

  return new Date(parsed - INCREMENTAL_SAFETY_BUFFER_MS).toISOString();
}

/**
 * Sync approved events from PCO to local database.
 *
 * - Fetches approved event instances within the date range
 * - In "incremental" mode, only instances updated since the last sync are
 *   fetched, and stale events are NOT deleted (the result is a delta)
 * - In "full" mode, the result is the complete set, so events no longer in
 *   PCO are deleted
 * - Per-instance room/tag lookups and database upserts run concurrently;
 *   the PCO client enforces the API rate limit
 *
 * @param options.daysAhead - Days to look ahead (default: 365)
 * @param options.mode - "full" (default) or "incremental"
 */
export async function syncEvents(options: SyncOptions = {}): Promise<SyncResult> {
  const { daysAhead = 365 } = options;
  let mode: SyncMode = options.mode ?? "full";

  let updatedSince: string | undefined;
  if (mode === "incremental") {
    const cursor = await getIncrementalCursor();
    if (cursor) {
      updatedSince = cursor;
    } else {
      // Nothing synced yet — a delta is meaningless, do a full sync.
      mode = "full";
    }
  }

  const result: SyncResult = {
    created: 0,
    updated: 0,
    deleted: 0,
    total: 0,
    errors: [],
    mode,
  };

  try {
    // 1. Fetch events from PCO
    const { instances, included } = await fetchApprovedEvents(daysAhead, updatedSince);
    result.total = instances.length;

    if (instances.length === 0) {
      return result;
    }

    // 2. Build instance -> parent event ID lookup (tags are per-event)
    const eventIdMap = new Map<string, string>();
    for (const instance of instances) {
      const eventId = instance.relationships?.event?.data?.id;
      if (eventId) {
        eventIdMap.set(instance.id, eventId);
      }
    }

    // Cache event-tag fetches by parent event (many instances share a parent).
    // Storing the promise dedupes concurrent lookups.
    const eventTagsCache = new Map<string, Promise<string[]>>();

    let submissionsByEventId = new Map<string, PcoEventRequestSubmission[]>();
    try {
      submissionsByEventId = await fetchEventRequestSubmissionsMap();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`Event request submissions: ${message}`);
    }

    // 3. Fetch rooms + tags and transform every instance, in parallel.
    const processed = await mapWithConcurrency(instances, 12, async (instance) => {
      try {
        const roomResources = await fetchInstanceRooms(instance.id);
        const rooms = roomResources.map((r) => r.attributes.name);

        const eventId = eventIdMap.get(instance.id);
        let eventType: string | null = null;
        let submissions: PcoEventRequestSubmission[] = [];

        if (eventId) {
          let tagsPromise = eventTagsCache.get(eventId);
          if (!tagsPromise) {
            tagsPromise = fetchEventTags(eventId);
            eventTagsCache.set(eventId, tagsPromise);
          }
          const tags = await tagsPromise;
          eventType = tags.length > 0 ? tags[0] : null;
        }

        if (eventType && EXCLUDED_EVENT_TYPES.has(eventType)) {
          return null;
        }

        if (eventId) {
          submissions = submissionsByEventId.get(eventId) ?? [];

          await db
            .delete(eventFormSubmissions)
            .where(eq(eventFormSubmissions.eventId, instance.id));

          if (submissions.length > 0) {
            await db.insert(eventFormSubmissions).values(
              submissions.map((submission) => ({
                eventId: instance.id,
                submissionId: submission.id,
                submittedAt: submission.submittedAt,
                submitterName: submission.submitterName,
                submitterEmail: submission.submitterEmail,
                submitterPhone: submission.submitterPhone,
                submitterPersonId: submission.submitterPersonId,
                responses:
                  submission.responses.length > 0
                    ? JSON.stringify(submission.responses)
                    : JSON.stringify(submission.rawAttributes),
              }))
            );
          }
        }

        const event = transformPcoEventInstance(instance, included, {
          rooms,
          eventType,
        });
        const mostRecentSubmission = pickMostRecentSubmission(submissions);
        if (mostRecentSubmission) {
          event.contactName = mostRecentSubmission.submitterName || event.contactName;
          event.contactEmail = mostRecentSubmission.submitterEmail || event.contactEmail;
          event.contactPhone = mostRecentSubmission.submitterPhone || event.contactPhone;
        }
        return event;
      } catch (error) {
        // If fetching extras fails, transform without them.
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Extras for instance ${instance.id}: ${message}`);
        return transformPcoEventInstance(instance, included);
      }
    });

    const newEvents = processed.filter((event): event is NewEvent => event !== null);

    // 4. Compare against existing events
    const existingEvents = await db.select({ id: events.id }).from(events);
    const existingIds = new Set(existingEvents.map((e) => e.id));
    const incomingIds = new Set(newEvents.map((e) => e.id));

    // 5. Upsert events in parallel
    await mapWithConcurrency(newEvents, 8, async (event) => {
      try {
        if (existingIds.has(event.id)) {
          await db
            .update(events)
            .set({
              title: event.title,
              eventType: event.eventType,
              description: event.description,
              startAt: event.startAt,
              endAt: event.endAt,
              campus: event.campus,
              rooms: event.rooms,
              contactName: event.contactName,
              contactEmail: event.contactEmail,
              contactPhone: event.contactPhone,
              owner: event.owner,
              formUrl: event.formUrl,
              formFields: event.formFields,
              syncedAt: event.syncedAt,
            })
            .where(eq(events.id, event.id));
          result.updated++;
        } else {
          await db.insert(events).values(event);

          const meta: NewEventMeta = {
            eventId: event.id,
            status: "not_contacted",
            updatedAt: new Date().toISOString(),
          };
          await db.insert(eventMeta).values(meta);
          result.created++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Event ${event.id}: ${message}`);
      }
    });

    // 6. Delete events no longer in PCO — only in a full sync, where the
    //    fetched set is complete. An incremental sync returns a delta, so a
    //    missing event just means "unchanged", not "deleted".
    if (mode === "full") {
      const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

      if (idsToDelete.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < idsToDelete.length; i += batchSize) {
          const batch = idsToDelete.slice(i, i + batchSize);
          await db.delete(events).where(inArray(events.id, batch));
        }
        result.deleted = idsToDelete.length;
      }
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.errors.push(`Sync failed: ${message}`);
    return result;
  }
}

/**
 * Get sync status - useful for displaying last sync info
 */
export async function getSyncStatus(): Promise<{
  totalEvents: number;
  lastSyncAt: string | null;
}> {
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(events);

  const lastSync = await db
    .select({ syncedAt: events.syncedAt })
    .from(events)
    .orderBy(sql`${events.syncedAt} DESC`)
    .limit(1);

  return {
    totalEvents: countResult[0]?.count || 0,
    lastSyncAt: lastSync[0]?.syncedAt || null,
  };
}
