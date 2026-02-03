import {
  db,
  events,
  eventMeta,
  coordinators,
  eventFormSubmissions,
  type EventStatus,
  type Coordinator,
  type EventFormSubmission,
} from "@/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  campus?: string;
  eventType?: string;
  status?: EventStatus;
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
    conditions.push(gte(events.startAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(events.startAt, filters.endDate));
  }
  if (filters.campus) {
    conditions.push(eq(events.campus, filters.campus));
  }
  if (filters.eventType) {
    conditions.push(eq(events.eventType, filters.eventType));
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
}> {
  const typeResults = await db
    .selectDistinct({ eventType: events.eventType })
    .from(events)
    .where(sql`${events.eventType} IS NOT NULL`);

  return {
    eventTypes: typeResults.map((r) => r.eventType!).sort(),
  };
}

/**
 * Fetch all coordinators ordered by name
 */
export async function getCoordinators(): Promise<Coordinator[]> {
  return await db.select().from(coordinators).orderBy(coordinators.name);
}

/**
 * Upsert event metadata (status and/or coordinator assignment)
 */
export async function updateEventMeta(
  eventId: string,
  updates: { status?: EventStatus; coordinatorId?: number | null }
): Promise<void> {
  const now = new Date().toISOString();

  const existing = await db
    .select()
    .from(eventMeta)
    .where(eq(eventMeta.eventId, eventId))
    .limit(1);

  if (existing.length > 0) {
    const set: { updatedAt: string; status?: EventStatus; coordinatorId?: number | null } = {
      updatedAt: now,
    };
    if (updates.status !== undefined) set.status = updates.status;
    if (updates.coordinatorId !== undefined) set.coordinatorId = updates.coordinatorId;

    await db.update(eventMeta).set(set).where(eq(eventMeta.eventId, eventId));
  } else {
    await db.insert(eventMeta).values({
      eventId,
      status: updates.status ?? "not_contacted",
      coordinatorId: updates.coordinatorId ?? null,
      updatedAt: now,
    });
  }
}
