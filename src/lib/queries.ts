import {
  db,
  events,
  eventMeta,
  coordinators,
  eventFormSubmissions,
  eventTimelineNotes,
  type EventStatus,
  type Coordinator,
  type EventFormSubmission,
  type EventTimelineNote,
} from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";

const DEFAULT_COORDINATORS: Array<{ name: string; email: string | null }> = [
  { name: "Bianca Nicolai", email: null },
  { name: "Estera Groza", email: null },
];

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  campus?: string;
  eventType?: string;
  status?: EventStatus;
  coordinatorId?: number | "unassigned";
}

export interface EventWithMeta {
  id: string;
  title: string;
  eventType: string | null;
  description: string | null;
  startAt: string;
  endAt: string | null;
  campus: string | null;
  rooms: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  owner: string | null;
  formUrl: string | null;
  formFields: string | null;
  syncedAt: string;
  status: EventStatus;
  coordinatorId: number | null;
  setupNotes: string | null;
  estimatedAttendance: string | null;
  eventLocations: string | null;
  additionalComments: string | null;
  coordinatorName: string | null;
  coordinatorEmail: string | null;
  formSubmissions?: EventFormSubmission[];
}

/**
 * Fetch events with optional filters, joined with metadata and coordinator info
 */
export async function getEvents(filters: EventFilters = {}): Promise<EventWithMeta[]> {
  const conditions = [];

  if (filters.startDate) {
    conditions.push(sql`datetime(${events.startAt}) >= datetime(${filters.startDate})`);
  }
  if (filters.endDate) {
    conditions.push(sql`datetime(${events.startAt}) <= datetime(${filters.endDate})`);
  }
  if (filters.campus) {
    conditions.push(eq(events.campus, filters.campus));
  }
  if (filters.eventType) {
    conditions.push(eq(events.eventType, filters.eventType));
  }
  if (filters.coordinatorId === "unassigned") {
    conditions.push(sql`${eventMeta.coordinatorId} IS NULL`);
  } else if (filters.coordinatorId !== undefined) {
    conditions.push(eq(eventMeta.coordinatorId, filters.coordinatorId));
  }

  const results = await db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      description: events.description,
      startAt: events.startAt,
      endAt: events.endAt,
      campus: events.campus,
      rooms: events.rooms,
      contactName: events.contactName,
      contactEmail: events.contactEmail,
      contactPhone: events.contactPhone,
      owner: events.owner,
      formUrl: events.formUrl,
      formFields: events.formFields,
      syncedAt: events.syncedAt,
      status: eventMeta.status,
      coordinatorId: eventMeta.coordinatorId,
      setupNotes: eventMeta.setupNotes,
      estimatedAttendance: eventMeta.estimatedAttendance,
      eventLocations: eventMeta.eventLocations,
      additionalComments: eventMeta.additionalComments,
      coordinatorName: coordinators.name,
      coordinatorEmail: coordinators.email,
    })
    .from(events)
    .leftJoin(eventMeta, eq(events.id, eventMeta.eventId))
    .leftJoin(coordinators, eq(eventMeta.coordinatorId, coordinators.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(events.startAt);

  // Filter by status after join (since it's in eventMeta)
  let filtered = results.map((r) => ({
    ...r,
    status: r.status ?? "not_contacted" as EventStatus,
  }));

  if (filters.status) {
    filtered = filtered.filter((e) => e.status === filters.status);
  }

  return filtered;
}

/**
 * Fetch a single event by ID with full metadata
 */
export async function getEventById(id: string): Promise<EventWithMeta | null> {
  const eventPromise = db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      description: events.description,
      startAt: events.startAt,
      endAt: events.endAt,
      campus: events.campus,
      rooms: events.rooms,
      contactName: events.contactName,
      contactEmail: events.contactEmail,
      contactPhone: events.contactPhone,
      owner: events.owner,
      formUrl: events.formUrl,
      formFields: events.formFields,
      syncedAt: events.syncedAt,
      status: eventMeta.status,
      coordinatorId: eventMeta.coordinatorId,
      setupNotes: eventMeta.setupNotes,
      estimatedAttendance: eventMeta.estimatedAttendance,
      eventLocations: eventMeta.eventLocations,
      additionalComments: eventMeta.additionalComments,
      coordinatorName: coordinators.name,
      coordinatorEmail: coordinators.email,
    })
    .from(events)
    .leftJoin(eventMeta, eq(events.id, eventMeta.eventId))
    .leftJoin(coordinators, eq(eventMeta.coordinatorId, coordinators.id))
    .where(eq(events.id, id))
    .limit(1);

  const submissionsPromise = db
    .select()
    .from(eventFormSubmissions)
    .where(eq(eventFormSubmissions.eventId, id))
    .orderBy(eventFormSubmissions.submittedAt)
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("event_form_submissions")) {
        return [] as EventFormSubmission[];
      }
      throw error;
    });

  const [results, submissions] = await Promise.all([eventPromise, submissionsPromise]);

  if (results.length === 0) return null;

  return {
    ...results[0],
    status: results[0].status ?? "not_contacted" as EventStatus,
    formSubmissions: submissions,
  };
}

/**
 * Get distinct values for filter dropdowns
 */
export async function getFilterOptions(): Promise<{
  eventTypes: string[];
  coordinators: Array<{ id: number; name: string }>;
}> {
  const typeResults = await db
    .selectDistinct({ eventType: events.eventType })
    .from(events)
    .where(sql`${events.eventType} IS NOT NULL`);
  const coordinatorResults = await getCoordinators();

  return {
    eventTypes: typeResults.map((r) => r.eventType!).sort(),
    coordinators: coordinatorResults.map((coordinator) => ({
      id: coordinator.id,
      name: coordinator.name,
    })),
  };
}

/**
 * Fetch all coordinators ordered by name
 */
export async function getCoordinators(): Promise<Coordinator[]> {
  await db
    .update(coordinators)
    .set({ name: "Bianca Nicolai" })
    .where(eq(coordinators.name, "Bianca Nicola"));

  const existingRows = await db.select().from(coordinators).orderBy(coordinators.id);
  const firstIdByName = new Map<string, number>();
  const duplicateIdToCanonicalId = new Map<number, number>();

  for (const coordinator of existingRows) {
    const key = coordinator.name.trim().toLowerCase();
    const canonicalId = firstIdByName.get(key);
    if (canonicalId === undefined) {
      firstIdByName.set(key, coordinator.id);
      continue;
    }
    if (coordinator.id !== canonicalId) {
      duplicateIdToCanonicalId.set(coordinator.id, canonicalId);
    }
  }

  if (duplicateIdToCanonicalId.size > 0) {
    for (const [duplicateId, canonicalId] of duplicateIdToCanonicalId.entries()) {
      await db
        .update(eventMeta)
        .set({ coordinatorId: canonicalId })
        .where(eq(eventMeta.coordinatorId, duplicateId));

      await db.delete(coordinators).where(eq(coordinators.id, duplicateId));
    }
  }

  const existing = await db.select({ name: coordinators.name }).from(coordinators);
  const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
  const missingDefaults = DEFAULT_COORDINATORS.filter(
    (coordinator) => !existingNames.has(coordinator.name.toLowerCase())
  );

  if (missingDefaults.length > 0) {
    await db.insert(coordinators).values(missingDefaults);
  }

  return await db.select().from(coordinators).orderBy(coordinators.name);
}

/**
 * Upsert event metadata (status and/or coordinator assignment)
 */
export async function updateEventMeta(
  eventId: string,
  updates: {
    status?: EventStatus;
    coordinatorId?: number | null;
    setupNotes?: string | null;
    estimatedAttendance?: string | null;
    eventLocations?: string | null;
    additionalComments?: string | null;
  }
): Promise<void> {
  const now = new Date().toISOString();

  const existing = await db
    .select()
    .from(eventMeta)
    .where(eq(eventMeta.eventId, eventId))
    .limit(1);

  if (existing.length > 0) {
    const set: {
      updatedAt: string;
      status?: EventStatus;
      coordinatorId?: number | null;
      setupNotes?: string | null;
      estimatedAttendance?: string | null;
      eventLocations?: string | null;
      additionalComments?: string | null;
    } = {
      updatedAt: now,
    };
    if (updates.status !== undefined) set.status = updates.status;
    if (updates.coordinatorId !== undefined) set.coordinatorId = updates.coordinatorId;
    if (updates.setupNotes !== undefined) set.setupNotes = updates.setupNotes;
    if (updates.estimatedAttendance !== undefined) {
      set.estimatedAttendance = updates.estimatedAttendance;
    }
    if (updates.eventLocations !== undefined) set.eventLocations = updates.eventLocations;
    if (updates.additionalComments !== undefined) {
      set.additionalComments = updates.additionalComments;
    }

    await db.update(eventMeta).set(set).where(eq(eventMeta.eventId, eventId));
  } else {
    await db.insert(eventMeta).values({
      eventId,
      status: updates.status ?? "not_contacted",
      coordinatorId: updates.coordinatorId ?? null,
      setupNotes: updates.setupNotes ?? null,
      estimatedAttendance: updates.estimatedAttendance ?? null,
      eventLocations: updates.eventLocations ?? null,
      additionalComments: updates.additionalComments ?? null,
      updatedAt: now,
    });
  }
}

/**
 * Fetch timeline notes for a specific event, newest first
 */
export async function getEventTimelineNotes(eventId: string): Promise<EventTimelineNote[]> {
  return await db
    .select()
    .from(eventTimelineNotes)
    .where(eq(eventTimelineNotes.eventId, eventId))
    .orderBy(desc(eventTimelineNotes.createdAt), desc(eventTimelineNotes.id));
}

/**
 * Create a timeline note for an event
 */
export async function createEventTimelineNote(
  eventId: string,
  authorName: string,
  note: string
): Promise<EventTimelineNote> {
  const [created] = await db
    .insert(eventTimelineNotes)
    .values({
      eventId,
      authorName,
      note,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return created;
}

/**
 * Delete a timeline note by event/note pair.
 * Returns true when a note was deleted, false when target does not exist.
 */
export async function deleteEventTimelineNote(eventId: string, noteId: number): Promise<boolean> {
  const existing = await db
    .select({ id: eventTimelineNotes.id })
    .from(eventTimelineNotes)
    .where(and(eq(eventTimelineNotes.eventId, eventId), eq(eventTimelineNotes.id, noteId)))
    .limit(1);

  if (existing.length === 0) {
    return false;
  }

  await db
    .delete(eventTimelineNotes)
    .where(and(eq(eventTimelineNotes.eventId, eventId), eq(eventTimelineNotes.id, noteId)));

  return true;
}
