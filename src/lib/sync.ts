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
import type { NewEvent, NewEventMeta } from "@/db/schema";
import type { PcoEventInstanceResource, PcoIncludedResource, PcoEventResource } from "./pco";

const EXCLUDED_EVENT_TYPES = new Set(["Practice", "Service"]);

export interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  total: number;
  errors: string[];
}

/**
 * Sync approved events from PCO to local database
 *
 * - Fetches all approved event instances within date range
 * - Transforms to local model
 * - Upserts to events table
 * - Creates event_meta for new events (status: not_contacted)
 * - Deletes events no longer in PCO
 *
 * @param daysAhead - Number of days to look ahead (default: 90)
 */
export async function syncEvents(daysAhead = 90): Promise<SyncResult> {
  const result: SyncResult = {
    created: 0,
    updated: 0,
    deleted: 0,
    total: 0,
    errors: [],
  };

  try {
    // 1. Fetch events from PCO
    const { instances, included } = await fetchApprovedEvents(daysAhead);
    result.total = instances.length;

    if (instances.length === 0) {
      return result;
    }

    // 2. Build event ID lookup for fetching tags (tags are per-event, not per-instance)
    const eventIdMap = new Map<string, string>(); // instanceId -> eventId
    for (const instance of instances) {
      const eventId = instance.relationships?.event?.data?.id;
      if (eventId) {
        eventIdMap.set(instance.id, eventId);
      }
    }

    // 3. Fetch rooms and tags, then transform each instance
    // PCO rate limit: 100 requests per 20 seconds = 200ms between requests
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const newEvents: NewEvent[] = [];

    // Cache event tags to avoid duplicate requests (many instances share the same parent event)
    const eventTagsCache = new Map<string, string[]>();
    let submissionsByEventId = new Map<string, PcoEventRequestSubmission[]>();

    try {
      submissionsByEventId = await fetchEventRequestSubmissionsMap();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`Event request submissions: ${message}`);
    }

    for (const instance of instances) {
      try {
        // Fetch rooms for this instance
        const roomResources = await fetchInstanceRooms(instance.id);
        const rooms = roomResources.map((r) => r.attributes.name);

        // Delay after rooms request
        await delay(210);

        // Fetch tags for the parent event (use cache if available)
        const eventId = eventIdMap.get(instance.id);
        let eventType: string | null = null;
        let submissions: PcoEventRequestSubmission[] = [];
        if (eventId) {
          let tags = eventTagsCache.get(eventId);
          if (!tags) {
            tags = await fetchEventTags(eventId);
            eventTagsCache.set(eventId, tags);
            // Delay only if we made an API call
            await delay(210);
          }
          eventType = tags.length > 0 ? tags[0] : null;
        }

        if (eventType && EXCLUDED_EVENT_TYPES.has(eventType)) {
          continue;
        }

        if (eventId) {
          submissions = submissionsByEventId.get(eventId) ?? [];
        }

        if (eventId) {
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
                responses:
                  submission.responses.length > 0
                    ? JSON.stringify(submission.responses)
                    : JSON.stringify(submission.rawAttributes),
              }))
            );
          }
        }

        // Transform with extras
        const event = transformPcoEventInstance(instance, included, {
          rooms,
          eventType,
        });
        newEvents.push(event);
      } catch (error) {
        // If fetching extras fails, transform without them
        const event = transformPcoEventInstance(instance, included);
        newEvents.push(event);
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Extras for instance ${instance.id}: ${message}`);
      }
    }

    // 3. Get existing event IDs for comparison
    const existingEvents = await db.select({ id: events.id }).from(events);
    const existingIds = new Set(existingEvents.map((e) => e.id));
    const incomingIds = new Set(newEvents.map((e) => e.id));

    // 4. Upsert events
    for (const event of newEvents) {
      try {
        if (existingIds.has(event.id)) {
          // Update existing event
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
          // Insert new event
          await db.insert(events).values(event);

          // Create event_meta with default status
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
    }

    // 5. Delete events no longer in PCO
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    if (idsToDelete.length > 0) {
      // Delete in batches to avoid query size limits
      const batchSize = 50;
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        await db.delete(events).where(inArray(events.id, batch));
      }
      result.deleted = idsToDelete.length;
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
