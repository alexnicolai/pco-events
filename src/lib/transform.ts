/**
 * Transform PCO API responses to local database models
 */

import type { NewEvent } from "@/db/schema";
import type {
  PcoEventInstanceResource,
  PcoEventResource,
  PcoIncludedResource,
  PcoPersonResource,
} from "./pco";

/**
 * Find an included resource by type and ID
 */
function findIncluded<T extends PcoIncludedResource>(
  included: PcoIncludedResource[],
  type: T["type"],
  id: string
): T | undefined {
  return included.find((r) => r.type === type && r.id === id) as T | undefined;
}

/**
 * Extract primary email from a person's contact data
 */
function extractEmail(person: PcoPersonResource): string | null {
  const emails = person.attributes.contact_data?.email_addresses;
  if (!emails?.length) return null;
  const primary = emails.find((e) => e.primary) || emails[0];
  return primary?.address || null;
}

/**
 * Extract primary phone from a person's contact data
 */
function extractPhone(person: PcoPersonResource): string | null {
  const phones = person.attributes.contact_data?.phone_numbers;
  if (!phones?.length) return null;
  const primary = phones.find((p) => p.primary) || phones[0];
  return primary?.number || null;
}

/**
 * Get full name from a person resource
 */
function getFullName(person: PcoPersonResource): string {
  const { first_name, last_name, name_prefix, name_suffix } = person.attributes;
  const parts = [name_prefix, first_name, last_name, name_suffix].filter(Boolean);
  return parts.join(" ");
}

/**
 * Parse campus name from location string
 * Extracts just the campus name before the address
 * Example: "Philadelphia Romanian Church - 581 Old Peachtree Rd, ..." -> "Philadelphia Romanian Church"
 */
function parseCampusName(location: string | null): string | null {
  if (!location) return null;

  // Split by " - " to separate campus name from address
  const parts = location.split(" - ");
  if (parts.length > 1) {
    return parts[0].trim();
  }

  // If no separator, return the whole string
  return location.trim();
}

/**
 * Transform a PCO event instance to local Event model
 *
 * @param instance - The PCO event instance resource
 * @param included - Array of included related resources
 * @returns NewEvent ready for database insertion
 */
export function transformPcoEventInstance(
  instance: PcoEventInstanceResource,
  included: PcoIncludedResource[]
): NewEvent {
  // Find the parent event from included resources
  const eventId = instance.relationships?.event?.data.id;
  const event = eventId
    ? findIncluded<PcoEventResource>(included, "Event", eventId)
    : included.find((r): r is PcoEventResource => r.type === "Event");

  // Find owner (person who created the event)
  let owner: PcoPersonResource | undefined;
  if (event?.relationships?.owner?.data) {
    owner = findIncluded<PcoPersonResource>(
      included,
      "Person",
      event.relationships.owner.data.id
    );
  }

  // Build the local event record
  const newEvent: NewEvent = {
    // Use instance ID as primary key (not event ID) since each instance is unique
    id: instance.id,
    title: event?.attributes.name || "Untitled Event",
    eventType: null, // PCO doesn't have a direct event type field
    description: event?.attributes.description || null,
    startAt: instance.attributes.starts_at,
    endAt: instance.attributes.ends_at,
    campus: parseCampusName(instance.attributes.location),
    rooms: null, // Rooms require separate API call, handled in sync
    contactName: owner ? getFullName(owner) : null,
    contactEmail: owner ? extractEmail(owner) : null,
    contactPhone: owner ? extractPhone(owner) : null,
    owner: owner ? getFullName(owner) : null,
    formUrl: event?.attributes.registration_url || null,
    formFields: null, // Form fields require separate API call if needed
    syncedAt: new Date().toISOString(),
  };

  return newEvent;
}

/**
 * Transform multiple PCO event instances
 */
export function transformPcoEventInstances(
  instances: PcoEventInstanceResource[],
  included: PcoIncludedResource[]
): NewEvent[] {
  // Group instances by their parent event for efficient lookup
  const eventMap = new Map<string, PcoEventResource>();

  for (const item of included) {
    if (item.type === "Event") {
      eventMap.set(item.id, item);
    }
  }

  return instances.map((instance) => transformPcoEventInstance(instance, included));
}
