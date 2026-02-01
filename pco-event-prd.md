# Event List App – PRD (v1)

Mobile-first internal web app that reads **approved** events from Planning Center Calendar and adds local status and coordinator assignment.[web:2][web:39][web:49]

---

## 1. Product Summary

A mobile-first internal web app that pulls **approved** events from Planning Center Calendar and displays them as a date-sorted list of cards, with a detail view per event.[web:39][web:51] The app is read-only with respect to Planning Center but adds **local custom status** and **coordinator assignment** fields stored in the app’s own database.

---

## 2. Goals and Non-Goals

### 2.1 Goals (v1)

- Surface all upcoming **approved** Planning Center Calendar events in a simple mobile UI.[web:49][web:51]  
- Show key event info: who, what, when, where, and full form submission responses.[web:39][web:42][web:25]  
- Allow the user to track a **local status** per event (Not Contacted, Contacted, Completed).  
- Allow assigning a **local coordinator** from a predefined list.  
- Support manual refresh plus daily background sync from Planning Center.[web:2][web:54]  
- Run as a **Next.js** app deployed to Vercel, optimized for mobile web.

### 2.2 Non-Goals (v1)

- No login/auth (single internal user; app is effectively “shared secret URL” internal tool).  
- No writes back to Planning Center (events remain read-only in PCO).[web:2]  
- No file uploads or attachments.  
- No notifications (email, SMS, push, Slack).  
- No multi-user permissions or role system.

---

## 3. Users and Use Cases

### 3.1 Primary User

- Single internal **Event Coordinator** using the app on mobile to quickly see upcoming approved events and track coordination work.

### 3.2 Key Use Cases

1. Scan upcoming confirmed (approved) events in chronological order.  
2. Tap into an event to see **all details and form responses** pulled from Planning Center request forms.[web:42][web:25]  
3. Mark the event as Not Contacted → Contacted → Completed (local workflow).  
4. Optionally assign a coordinator from a dropdown list.  
5. Manually refresh to pull the latest approved events from Planning Center.

---

## 4. Data Model

### 4.1 Source Data from Planning Center Calendar (Read-Only)

The app reads from the Planning Center **Calendar** API, limited to **approved** events.[web:2][web:49][web:51]

For each approved event, pull:

#### Who

- Primary contact name (requester/owner from event request form or event owner).[web:42][web:51]  
- Primary contact email.  
- Primary contact phone (if available).  
- Ministry/department or event owner (Calendar event owner).[web:51]  
- Event owner/requester if distinct from contact.

#### What

- Event title.[web:39][web:51]  
- Event type (wedding, bridal shower, baby shower, general, etc.) – can be based on templates or form fields.[web:25]  
- Short description or summary.

#### When

- Start date and time.  
- End date and time.  
- For multi-day/recurring events:  
  - v1 option: treat each approved instance as its own “row” or show at least the **next upcoming instance** per event.

#### Where

- Campus/location name (Calendar location).[web:39]  
- Rooms / spaces (from room/resource bookings).[web:51]

#### Form Submission Details

- Direct link back to the original PCO event request submission (Calendar event request form submission URL).[web:42]  
- All form fields and their responses (customizable fields like dropdowns, text, etc.).[web:25][web:42]

### 4.2 Local App Data (Outside PCO)

Stored in the app’s own DB, keyed by Planning Center event ID.

Per event:

- `status` (enum):  
  - Not Contacted (default)  
  - Contacted  
  - Completed  

- `coordinator_id` (nullable):  
  - References a local `coordinators` table.

Coordinators:

- `id` (string or UUID).  
- `name` (e.g., "Alex Johnson").  
- Optional `email` for future use.

---

## 5. Core Features

### 5.1 Event List Screen (Mobile-First)

**Purpose:** Give a quick, scannable overview of all upcoming approved events.

#### Behavior

- Shows a **single-column list** of event cards.  
- Sorted by event **start date/time**, soonest → later.  
- Includes only upcoming, approved events within a chosen time window (e.g., today → +90 days).[web:49][web:51]  
- Supports filtering by date range, campus, and event type.

#### Per-Card Content

- Event title.  
- Date and time (formatted, e.g., “Sat, Feb 14 · 3:00–6:00 PM”).  
- Location (campus + primary room, or “Multiple rooms” if necessary).  
- Event type badge (Wedding, Bridal Shower, Baby Shower, General).  
- Status pill (Not Contacted / Contacted / Completed).  
- Coordinator name if assigned (“Coordinator: Alex”).

#### Interactions

- Tap a card → navigate to **Event Detail** screen.  
- Tap Refresh button or pull-to-refresh → call backend sync endpoint, then reload data.  
- Adjust filters via a simple row of controls or a slide-down filter area.

### 5.2 Filtering

Filters available on the list:

- Date range:  
  - All upcoming  
  - This week  
  - Next 30 days  

- Campus/location:  
  - Dropdown or segmented control listing campuses in use.  

- Event type:  
  - Multi-select or segmented: Wedding, Bridal Shower, Baby Shower, General.

Implementation may be front-end filtering over a pre-fetched list (given expected 12–24 events) or query parameters to backend.

### 5.3 Event Detail Screen

**Purpose:** Provide full information for a single event + local meta.

#### Layout

- **Header**  
  - Event title (primary).  
  - Event type badge.  
  - Status pill with interactive control (dropdown or segmented control).  
  - Coordinator dropdown with the list of coordinators.

- **When section**  
  - Start date and time.  
  - End date and time.  
  - Note if recurring/multi-day.

- **Where section**  
  - Campus name.  
  - List of all rooms/spaces.

- **Who section**

  - Primary contact:  
    - Name  
    - Email (mailto link)  
    - Phone (tel link)  

  - Ministry/department.  
  - Event owner/requester (if separate).

- **Form Submission section**

  - “View in Planning Center” link to open request in PCO in a new tab.[web:42]  
  - List of all fields and responses in a key-value layout (label + answer), including custom fields (checkboxes, dropdowns, text areas, etc.).[web:25][web:42]

#### Interactions

- Change status (updates local DB only).  
- Set/change coordinator (updates local DB only).  
- Back navigation to Event List.

---

## 6. Sync and Integration Behavior

### 6.1 Data Source

- Planning Center **Calendar** API for events and related request/form data.[web:2][web:39]  
- Events limited to those that are **approved** (all rooms/resources approved and event visible on Calendar feed).[web:49][web:51]

### 6.2 Read-Only From PCO

- The app does **not** modify or write back any event data in Planning Center in v1; it only reads.[web:2]  
- All edits (status, coordinator) are stored locally.

### 6.3 Sync Cadence

- **Scheduled daily sync** (server-side job):  
  - Once per day, fetch approved upcoming events and upsert into DB.  
- **Manual sync** (user-triggered):  
  - Manual Refresh button calls `/api/sync` endpoint to perform an immediate refresh and then reload visible data.

### 6.4 Sync Logic

- Fetch all approved upcoming events from PCO within configured time window.  
- Normalize and upsert into local `events` table keyed by PCO event ID.  
- Maintain or create `event_meta` records as needed.  
- When PCO event becomes unapproved or is removed:  
  - Mark as inactive or remove from local DB so it no longer appears in UI.  
- Ensure rate limits and errors are handled gracefully (retry/backoff and user-visible errors if manual refresh fails).[web:7][web:40][web:54]

---

## 7. UX and Design

### 7.1 Mobile-First Design

- Primary usage on phone; design for small screens first.  
- Single-column layout, vertical scrolling only.  
- Large, readable fonts for dates/times and titles.  
- Tap targets at least ~44px height for accessibility.

### 7.2 Navigation

- Simple nav:  
  - `/` – Event List  
  - `/events/[id]` – Event Detail  

- Back button on detail screen (browser back or explicit UI back control).

### 7.3 Visual Language (Suggested)

- Status colors:  
  - Not Contacted: gray pill.  
  - Contacted: blue pill.  
  - Completed: green pill.

- Event type badges: small, colored labels indicating Wedding / Bridal / Baby / General.  
- Consistent spacing and typography via Tailwind.

---

## 8. Technical Approach

### 8.1 Frontend

- **Framework**: Next.js (App Router) + React.  
- **Styling**: Tailwind CSS for rapid mobile-first UI.  
- **Data fetching**: Next.js API routes; optional client-side query library (e.g., React Query) if needed.

### 8.2 Backend

- **Integration module**:  
  - PCO API client wraps HTTP requests to Calendar API (with auth headers).[web:2][web:1]  

- **API routes**:  
  - `/api/events` – returns list of events + meta.  
  - `/api/events/[id]` – returns single event + meta.  
  - `/api/events/[id]/meta` – updates local status/coordinator.  
  - `/api/sync` – triggers sync job (manual).

### 8.3 Database

- DB provider: Supabase/Turso/PlanetScale (to be finalized).  
- Tables:  
  - `events` – denormalized PCO event data needed for UI.  
  - `event_meta` – status + coordinator per event.  
  - `coordinators` – static/semi-static list.

### 8.4 Hosting & Security

- **Hosting**: Vercel (Next.js app + API routes).  
- **Secrets**:  
  - Store PCO credentials and DB connection strings as environment variables.  
- **Access** (internal-only v1):  
  - No formal login; optionally rely on Vercel password protection or access by obscure URL.

---

## 9. Out of Scope (v1)

- Writing any data back into Planning Center (events/approvals/notes).[web:2]  
- File uploads (contracts, PDFs, etc.).  
- Notifications or alerts (email, SMS, push, Slack).  
- Full multi-user auth and role-based access control.  
- Offline mode and PWA-level caching (beyond basic browser caching).

