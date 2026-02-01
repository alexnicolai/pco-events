/**
 * Planning Center Online Calendar API Client
 *
 * Uses HTTP Basic Auth with Personal Access Token credentials.
 * API Docs: https://developer.planning.center/docs/#/apps/calendar
 */

const PCO_BASE_URL = "https://api.planningcenteronline.com/calendar/v2";

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
async function pcoFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${PCO_BASE_URL}${endpoint}`;

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

export interface PcoApiResponse<T> {
  data: T;
  included?: PcoIncludedResource[];
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
    "include": "event,event_times",
    "per_page": "100",
  });

  const allInstances: PcoEventInstanceResource[] = [];
  const allIncluded: PcoIncludedResource[] = [];
  let endpoint: string | null = `/event_instances?${params.toString()}`;

  // Paginate through all results
  while (endpoint !== null) {
    const response: PcoApiResponse<PcoEventInstanceResource[]> = await pcoFetch(endpoint);

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

  const response = await pcoFetch<PcoApiResponse<PcoEventResource>>(
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
  const response = await pcoFetch<PcoApiResponse<PcoRoomResource[]>>(
    `/event_instances/${instanceId}/event_times?include=room_setups`
  );

  // Extract rooms from included resources
  const rooms = (response.included || []).filter(
    (r): r is PcoRoomResource => r.type === "Room"
  );

  return rooms;
}

/**
 * Test the PCO connection
 * Useful for verifying credentials are working
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Fetch organization info as a simple health check
    const response = await pcoFetch<{ data: { type: string } }>("");
    return response.data?.type === "Organization";
  } catch {
    return false;
  }
}
