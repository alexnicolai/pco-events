/**
 * Planning Center Online Calendar API Client
 *
 * Uses HTTP Basic Auth with Personal Access Token credentials.
 * API Docs: https://developer.planning.center/docs/#/apps/calendar
 */

const PCO_CALENDAR_BASE_URL = "https://api.planningcenteronline.com/calendar/v2";
const PCO_PEOPLE_BASE_URL = "https://api.planningcenteronline.com/people/v2";

// Get auth credentials from environment
function getAuthHeader(): string {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;

  if (!appId || !secret) {
    throw new Error("PCO_APP_ID and PCO_SECRET must be set in environment variables");
  }

  const credentials = Buffer.from(`${appId}:${secret}`).toString("base64");
  return `Basic ${credentials}`;
}

// Generic fetch wrapper with auth and error handling
async function pcoFetch<T>(baseUrl: string, endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PCO API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function pcoCalendarFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return pcoFetch<T>(PCO_CALENDAR_BASE_URL, endpoint, options);
}

async function pcoPeopleFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return pcoFetch<T>(PCO_PEOPLE_BASE_URL, endpoint, options);
}

// ============================================================================
// Types for PCO Calendar API responses (JSON:API format)
// ============================================================================

export interface PcoEventResource {
  type: "Event";
  id: string;
  attributes: {
    approval_status: string;
    created_at: string;
    description: string | null;
    featured: boolean;
    image_url: string | null;
    name: string;
    percent_approved: number;
    percent_rejected: number;
    registration_url: string | null;
    summary: string | null;
    updated_at: string;
    visible_in_church_center: boolean;
  };
  relationships?: {
    owner?: { data: { type: string; id: string } };
    event_instances?: { data: Array<{ type: string; id: string }> };
  };
}

export interface PcoEventInstanceResource {
  type: "EventInstance";
  id: string;
  attributes: {
    all_day_event: boolean;
    compact_recurrence_description: string | null;
    created_at: string;
    ends_at: string;
    location: string | null;
    recurrence: string | null;
    recurrence_description: string | null;
    starts_at: string;
    updated_at: string;
  };
  relationships?: {
    event?: { data: { type: string; id: string } };
    event_times?: { data: Array<{ type: string; id: string }> };
  };
}

export interface PcoEventTimeResource {
  type: "EventTime";
  id: string;
  attributes: {
    ends_at: string;
    name: string | null;
    starts_at: string;
    visible_on_kiosks: boolean;
    visible_on_widget_and_ical: boolean;
  };
}

export interface PcoRoomResource {
  type: "Room";
  id: string;
  attributes: {
    created_at: string;
    name: string;
    updated_at: string;
  };
}

export interface PcoPersonResource {
  type: "Person";
  id: string;
  attributes: {
    created_at: string;
    first_name: string;
    last_name: string;
    name_prefix: string | null;
    name_suffix: string | null;
    updated_at: string;
    contact_data?: {
      email_addresses?: Array<{ address: string; primary: boolean }>;
      phone_numbers?: Array<{ number: string; primary: boolean }>;
    };
  };
}

export type PcoIncludedResource =
  | PcoEventResource
  | PcoEventInstanceResource
  | PcoEventTimeResource
  | PcoRoomResource
  | PcoPersonResource;

export interface PcoFormResponse {
  label: string;
  value: string;
}

export interface PcoEventRequestSubmission {
  id: string;
  submittedAt: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  submitterPersonId: string | null;
  responses: PcoFormResponse[];
  rawAttributes: Record<string, unknown>;
}

interface PcoGenericResource {
  type?: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

interface PcoPeoplePersonResource {
  type: "Person";
  id: string;
  attributes?: {
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
}

interface PcoPeopleEmailResource {
  type: "Email";
  id: string;
  attributes?: {
    address?: string | null;
    primary?: boolean;
  };
}

interface PcoPeoplePhoneResource {
  type: "PhoneNumber";
  id: string;
  attributes?: {
    national?: string | null;
    number?: string | null;
    primary?: boolean;
  };
}

interface PcoPeoplePersonResponse {
  data: PcoPeoplePersonResource;
  included?: Array<PcoPeopleEmailResource | PcoPeoplePhoneResource>;
}

export interface PcoApiResponse<T, I = PcoIncludedResource> {
  data: T;
  included?: I[];
  meta?: {
    total_count: number;
    count: number;
    next?: { offset: number };
  };
  links?: {
    self: string;
    next?: string;
  };
}

// ============================================================================
// API Functions (to be implemented in Phase 1)
// ============================================================================

/**
 * Full response with included resources for event instances
 */
export interface PcoEventInstancesResponse {
  instances: PcoEventInstanceResource[];
  included: PcoIncludedResource[];
}

/**
 * Fetch approved event instances from PCO Calendar
 * Filters for future events within date range
 * Includes related event and event_times
 *
 * @param daysAhead - Number of days to look ahead (default: 90)
 */
export async function fetchApprovedEvents(daysAhead = 90): Promise<PcoEventInstancesResponse> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  // Format dates as ISO strings
  const startDate = today.toISOString();
  const endDate = futureDate.toISOString();

  // Build query params for event_instances endpoint
  const params = new URLSearchParams({
    "filter": "future,approved",
    "where[starts_at][gte]": startDate,
    "where[starts_at][lte]": endDate,
    "include": "event,event.owner,event_times",
    "per_page": "100",
  });

  const allInstances: PcoEventInstanceResource[] = [];
  const allIncluded: PcoIncludedResource[] = [];
  let endpoint: string | null = `/event_instances?${params.toString()}`;

  // Paginate through all results
  while (endpoint !== null) {
    const response: PcoApiResponse<PcoEventInstanceResource[]> =
      await pcoCalendarFetch(endpoint);

    if (Array.isArray(response.data)) {
      allInstances.push(...response.data);
    }

    if (response.included) {
      allIncluded.push(...response.included);
    }

    // Check for next page
    if (response.links?.next) {
      // Extract path from full URL
      const nextUrl = new URL(response.links.next);
      endpoint = nextUrl.pathname.replace("/calendar/v2", "") + nextUrl.search;
    } else if (response.meta?.next) {
      params.set("offset", String(response.meta.next.offset));
      endpoint = `/event_instances?${params.toString()}`;
    } else {
      endpoint = null;
    }
  }

  return { instances: allInstances, included: allIncluded };
}

function pickFirstString(attributes: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = attributes[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

interface PersonContactInfo {
  personId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

function getPrimaryEmail(
  included: Array<PcoPeopleEmailResource | PcoPeoplePhoneResource>
): string | null {
  const emails = included.filter(
    (resource): resource is PcoPeopleEmailResource => resource.type === "Email"
  );
  if (emails.length === 0) return null;
  const primaryEmail = emails.find((email) => email.attributes?.primary) ?? emails[0];
  const address = primaryEmail.attributes?.address;
  return typeof address === "string" && address.trim().length > 0 ? address : null;
}

function getPrimaryPhone(
  included: Array<PcoPeopleEmailResource | PcoPeoplePhoneResource>
): string | null {
  const phones = included.filter(
    (resource): resource is PcoPeoplePhoneResource => resource.type === "PhoneNumber"
  );
  if (phones.length === 0) return null;
  const primaryPhone = phones.find((phone) => phone.attributes?.primary) ?? phones[0];
  const national = primaryPhone.attributes?.national;
  if (typeof national === "string" && national.trim().length > 0) {
    return national;
  }
  const number = primaryPhone.attributes?.number;
  return typeof number === "string" && number.trim().length > 0 ? number : null;
}

function getPersonName(attributes: PcoPeoplePersonResource["attributes"]): string | null {
  if (!attributes) return null;
  if (typeof attributes.name === "string" && attributes.name.trim().length > 0) {
    return attributes.name;
  }
  const parts = [attributes.first_name, attributes.last_name].filter(
    (part): part is string => typeof part === "string" && part.trim().length > 0
  );
  return parts.length > 0 ? parts.join(" ") : null;
}

async function fetchPersonContact(personId: string): Promise<PersonContactInfo | null> {
  try {
    const response = await pcoPeopleFetch<PcoPeoplePersonResponse>(
      `/people/${personId}?include=emails,phone_numbers`
    );
    const included = Array.isArray(response.included) ? response.included : [];

    return {
      personId,
      name: getPersonName(response.data?.attributes),
      email: getPrimaryEmail(included),
      phone: getPrimaryPhone(included),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all event request form submissions grouped by event ID.
 * Calendar API only exposes limited submission attributes.
 */
export async function fetchEventRequestSubmissionsMap(): Promise<
  Map<string, PcoEventRequestSubmission[]>
> {
  const params = new URLSearchParams({
    include: "event,form_submission",
    per_page: "100",
  });

  const submissionsByEventId = new Map<string, PcoEventRequestSubmission[]>();
  const personContactCache = new Map<string, PersonContactInfo | null>();
  let endpoint: string | null = `/event_requests?${params.toString()}`;

  while (endpoint !== null) {
    const response: PcoApiResponse<PcoGenericResource[], PcoGenericResource> =
      await pcoCalendarFetch(endpoint);
    const requests = Array.isArray(response.data) ? response.data : [];
    const included = Array.isArray(response.included) ? response.included : [];
    const submissionById = new Map(
      included
        .filter((item: PcoGenericResource) => item.type === "FormSubmission")
        .map((item: PcoGenericResource) => [item.id, item])
    );

    for (const request of requests) {
      const eventId = (request.relationships as { event?: { data?: { id?: string } } })
        ?.event?.data?.id;
      const submissionId = (request.relationships as { form_submission?: { data?: { id?: string } } })
        ?.form_submission?.data?.id;
      const submitterPersonId = (request.relationships as {
        person?: { data?: { id?: string } };
      })?.person?.data?.id;

      if (!eventId || !submissionId) continue;

      const submission = submissionById.get(submissionId);
      const attributes = submission?.attributes ?? {};
      const submittedAt = pickFirstString(attributes, ["submitted_at"]) || null;

      const responses: PcoFormResponse[] = [];
      if (typeof attributes.event_name === "string") {
        responses.push({ label: "Event Name", value: attributes.event_name });
      }
      if (typeof attributes.starts_at === "string") {
        responses.push({ label: "Start", value: attributes.starts_at });
      }
      if (typeof attributes.ends_at === "string") {
        responses.push({ label: "End", value: attributes.ends_at });
      }
      if (typeof attributes.submitted_at === "string") {
        responses.push({ label: "Submitted At", value: attributes.submitted_at });
      }

      let personContact: PersonContactInfo | null = null;
      if (submitterPersonId) {
        if (!personContactCache.has(submitterPersonId)) {
          personContactCache.set(submitterPersonId, await fetchPersonContact(submitterPersonId));
        }
        personContact = personContactCache.get(submitterPersonId) ?? null;
      }

      const submissionRecord: PcoEventRequestSubmission = {
        id: submissionId,
        submittedAt,
        submitterName: personContact?.name ?? null,
        submitterEmail: personContact?.email ?? null,
        submitterPhone: personContact?.phone ?? null,
        submitterPersonId: submitterPersonId ?? null,
        responses,
        rawAttributes: attributes,
      };

      const existing = submissionsByEventId.get(eventId) ?? [];
      existing.push(submissionRecord);
      submissionsByEventId.set(eventId, existing);
    }

    if (response.links?.next) {
      const nextUrl = new URL(response.links.next);
      endpoint = nextUrl.pathname.replace("/calendar/v2", "") + nextUrl.search;
    } else if (response.meta?.next) {
      params.set("offset", String(response.meta.next.offset));
      endpoint = `/event_requests?${params.toString()}`;
    } else {
      endpoint = null;
    }
  }

  return submissionsByEventId;
}

/**
 * Fetch event request form submissions for a given event
 */
export async function fetchEventRequestFormSubmissions(
  eventId: string
): Promise<PcoEventRequestSubmission[]> {
  const submissionsByEventId = await fetchEventRequestSubmissionsMap();
  return submissionsByEventId.get(eventId) ?? [];
}

/**
 * Full response with included resources for a single event
 */
export interface PcoEventDetailResponse {
  event: PcoEventResource;
  included: PcoIncludedResource[];
}

/**
 * Fetch a single event with all details
 * Includes event instances, rooms, contacts, and form submissions
 *
 * @param eventId - The PCO event ID
 */
export async function fetchEventDetails(eventId: string): Promise<PcoEventDetailResponse> {
  const params = new URLSearchParams({
    "include": "event_instances,event_times,owner",
  });

  const response = await pcoCalendarFetch<PcoApiResponse<PcoEventResource>>(
    `/events/${eventId}?${params.toString()}`
  );

  return {
    event: response.data,
    included: response.included || [],
  };
}

/**
 * Fetch rooms for an event instance
 * @param instanceId - The PCO event instance ID
 */
export async function fetchInstanceRooms(instanceId: string): Promise<PcoRoomResource[]> {
  const response = await pcoCalendarFetch<PcoApiResponse<PcoRoomResource[]>>(
    `/event_instances/${instanceId}/event_times?include=room_setups,room_setups.room`
  );

  // Extract rooms from included resources
  const rooms = (response.included || []).filter(
    (r): r is PcoRoomResource => r.type === "Room"
  );

  return rooms;
}

export interface PcoTagResource {
  type: "Tag";
  id: string;
  attributes: {
    color: string;
    name: string;
    position: number;
  };
}

/**
 * Fetch tags for an event
 * @param eventId - The PCO event ID
 * @returns Array of tag names
 */
export async function fetchEventTags(eventId: string): Promise<string[]> {
  try {
    const response = await pcoCalendarFetch<PcoApiResponse<PcoTagResource[]>>(
      `/events/${eventId}/tags`
    );

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((tag) => tag.attributes.name);
  } catch {
    // Return empty array if tags endpoint fails (might not exist for all events)
    return [];
  }
}

/**
 * Test the PCO connection
 * Useful for verifying credentials are working
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Fetch organization info as a simple health check
    const response = await pcoCalendarFetch<{ data: { type: string } }>("");
    return response.data?.type === "Organization";
  } catch {
    return false;
  }
}
