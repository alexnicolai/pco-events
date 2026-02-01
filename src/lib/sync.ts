/**
 * Event synchronization logic
 * Syncs events from PCO Calendar to local Turso database
 */

import { eq, inArray, sql } from "drizzle-orm";
import { db, events, eventMeta } from "@/db";
import { fetchApprovedEvents } from "./pco";
import { transformPcoEventInstances } from "./transform";
import type { NewEvent, NewEventMeta } from "@/db/schema";

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

    // 2. Transform to local model
    const newEvents = transformPcoEventInstances(instances, included);

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
