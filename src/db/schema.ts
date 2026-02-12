import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

// Status enum values for event tracking
export const EVENT_STATUSES = ["not_contacted", "contacted", "completed"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

// Coordinators who can be assigned to events
export const coordinators = sqliteTable("coordinators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Events synced from Planning Center Calendar
export const events = sqliteTable("events", {
  id: text("id").primaryKey(), // PCO event ID
  title: text("title").notNull(),
  eventType: text("event_type"),
  description: text("description"),
  startAt: text("start_at").notNull(), // ISO 8601 datetime
  endAt: text("end_at"), // ISO 8601 datetime
  campus: text("campus"),
  rooms: text("rooms"), // JSON array of room names
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  owner: text("owner"), // Requester/owner name
  formUrl: text("form_url"),
  formFields: text("form_fields"), // JSON object of form field responses
  syncedAt: text("synced_at").notNull(), // Last sync timestamp
});

// Event request form submissions (per event instance)
export const eventFormSubmissions = sqliteTable(
  "event_form_submissions",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    submissionId: text("submission_id").notNull(),
    submittedAt: text("submitted_at"),
    submitterName: text("submitter_name"),
    submitterEmail: text("submitter_email"),
    responses: text("responses"), // JSON array or object of field responses
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.submissionId] }),
  })
);

// Timeline notes manually added by internal users for event updates
export const eventTimelineNotes = sqliteTable("event_timeline_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  note: text("note").notNull(),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Local metadata for events (status, coordinator assignment)
export const eventMeta = sqliteTable("event_meta", {
  eventId: text("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  status: text("status").$type<EventStatus>().notNull().default("not_contacted"),
  coordinatorId: integer("coordinator_id").references(() => coordinators.id),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

// TypeScript types inferred from schema
export type Coordinator = typeof coordinators.$inferSelect;
export type NewCoordinator = typeof coordinators.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventFormSubmission = typeof eventFormSubmissions.$inferSelect;
export type NewEventFormSubmission = typeof eventFormSubmissions.$inferInsert;
export type EventTimelineNote = typeof eventTimelineNotes.$inferSelect;
export type NewEventTimelineNote = typeof eventTimelineNotes.$inferInsert;
export type EventMeta = typeof eventMeta.$inferSelect;
export type NewEventMeta = typeof eventMeta.$inferInsert;
