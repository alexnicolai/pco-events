# Event List App – v1 Roadmap

Mobile-first internal web app that reads **approved** events from Planning Center Calendar and adds local status and coordinator assignment.

---

## Phase 0 – Project Setup & Architecture

### 0.1 Define Tech Stack and Repo

- [ ] Confirm stack: Next.js (App Router) + TypeScript + Tailwind CSS + simple DB (Supabase/PlanetScale/Turso/SQLite).  
- [ ] Create Git repo and basic project structure (`apps/web` or single app).  
- [ ] Set up environment variables pattern for PCO credentials and DB connection (e.g., `.env.local`).

### 0.2 Planning Center Access

- [ ] Create a **Personal Access Token** / app credentials in Planning Center for Calendar API usage (read-only permissions).[web:40][web:46]  
- [ ] Document API base URL and auth scheme (OAuth2/Bearer token with client id/secret).[web:40]  
- [ ] Decide which Calendar views/filters map to “approved events” on API side (approval status filter logic).[web:36][web:38]

### 0.3 Database & Persistence

- [ ] Choose DB provider (e.g., Supabase Postgres or Turso SQLite).  
- [ ] Design schema for:
  - `events` (PCO event ID, basic denormalized fields, timestamps).  
  - `event_meta` (status enum, coordinator_id).  
  - `coordinators` (id, name, email?).  
- [ ] Set up migrations (Prisma or SQL) and run initial migration.

---

## Phase 1 – Planning Center Integration (Backend)

### 1.1 Raw API Client

- [ ] Implement a small PCO client module:
  - Handles auth headers using personal access token or OAuth.  
  - Wraps HTTP calls with error handling and logging.  
- [ ] Add function to fetch **approved Calendar events** with necessary fields and relationships (who, what, when, where, form data).[web:39][web:47]  
- [ ] Decide on time window for “upcoming events” (e.g., today → +90 days).

### 1.2 Mapping & Normalization

- [ ] Define TypeScript types/interfaces for:
  - Raw PCO event payload.  
  - Normalized `Event` model used by the app (flattened who/what/when/where/form fields).  
- [ ] Implement transformer:
  - Extract primary contact, owner, times, campus, rooms, description, event type, form responses.  
  - Ensure proper handling of multi-day or recurring events.

### 1.3 Initial Sync Logic

- [ ] Implement a sync function:
  - Fetch all approved upcoming events from PCO.  
  - Upsert into local `events` table keyed by PCO event ID.  
  - Preserve or attach `event_meta` where it exists (status/coordinator).  
- [ ] Handle deletions or unapproved events by marking/removing from local DB.

---

## Phase 2 – Scheduled & Manual Sync

### 2.1 Daily Scheduled Sync

- [ ] Configure a scheduled job (Vercel Cron or external) to run sync once per day.  
- [ ] Ensure job uses the same sync function and logs success/fail outcomes.

### 2.2 Manual Refresh Endpoint

- [ ] Create Next.js API route `/api/sync`:
  - Triggers the same sync logic.  
  - Returns status and updated counts.  
- [ ] Add simple rate limiting or guard (e.g., can’t run more often than once per N minutes for this internal app).

---

## Phase 3 – Event List UI (Mobile-First)

### 3.1 Layout & Navigation

- [ ] Set up base layout with mobile-first design:  
  - Single-column layout, responsive typography, spacing via Tailwind.  
- [ ] Implement simple routing:  
  - `/` → Event List.  
  - `/events/[id]` → Event Detail.

### 3.2 Event List Screen

- [ ] Fetch events from a **read API route** (e.g., `/api/events`) that returns normalized events with meta.  
- [ ] Sort events by start date/time (soonest → later) on backend or frontend.  
- [ ] Build event cards showing:
  - Title.  
  - Date/time (start–end).  
  - Location (campus + primary room or “Multiple rooms”).  
  - Event type badge.  
  - Status pill (Not Contacted / Contacted / Completed).  
  - Coordinator name if assigned.  
- [ ] Add manual **Refresh** UI:
  - Button or pull-to-refresh pattern that calls `/api/sync` and then reloads events.

### 3.3 Filters

- [ ] Add simple filter controls (collapsible or top bar):  
  - Date range: “All upcoming”, “This week”, “Next 30 days”.  
  - Campus/location filter.  
  - Event type filter.  
- [ ] Connect filters to backend or in-memory filtering depending on event volume (12–24 typical).  
- [ ] Preserve filter selections in local state or URL query params.

---

## Phase 4 – Event Detail Screen

### 4.1 Detail Data

- [ ] Implement `/api/events/[id]` to return a single event with full details & meta.  
- [ ] Include:
  - Title, type, description/summary.  
  - Start/end date & time, recurring info if applicable.  
  - Campus and full rooms list.  
  - Primary contact (name, email, phone).  
  - Ministry/department, owner/requester.  
  - Form submission link and all form fields + responses.

### 4.2 Detail UI

- [ ] Build Event Detail page:
  - Header with title, type badge, status pill, coordinator dropdown.  
  - Sections: “When”, “Where”, “Who”, “Form Submission”.  
  - Scrollable layout optimized for mobile (no horizontal scrolling).  
- [ ] Link email and phone to mailto: and tel: actions.

### 4.3 Local Status & Coordinator

- [ ] Add **status control**:
  - UI component to set status to Not Contacted / Contacted / Completed.  
  - On change, call `/api/events/[id]/meta` (or similar) to update `event_meta`.  
- [ ] Add **coordinator dropdown**:
  - Preload coordinators list from API or static config.  
  - On selection, update event’s `coordinator_id`.

---

## Phase 5 – Quality, Polish, and Internal Use

### 5.1 UX Polish

- [ ] Ensure touch targets meet mobile guidelines (minimum 44px tap areas).  
- [ ] Improve empty/error states:
  - No events available.  
  - Sync failed (show retry).  
- [ ] Loading states and skeletons for list and detail views.

### 5.2 Performance & Reliability

- [ ] Add basic caching on API routes (in-memory or ISR-like pattern).  
- [ ] Handle PCO API rate limits and transient errors with retries/backoff.[web:7][web:40]  
- [ ] Confirm that large form submissions render efficiently (virtualization if necessary, but likely not needed at 12–24 events).

### 5.3 Security & Deployment

- [ ] Ensure all secrets (PCO credentials, DB URL) live in Vercel environment variables.  
- [ ] Optionally add simple protection (e.g., basic auth or Vercel password-protected deployment) since it’s internal only.  
- [ ] Deploy to Vercel and verify:
  - Daily cron.  
  - Manual sync.  
  - Event list and detail flows on real devices.

---

## Phase 6 – Post-v1 Notes / Future Ideas (Not in v1 Scope)

- Write back to PCO (e.g., updating summary or notes).  
- Multi-user login with roles and coordinator-specific views.  
- File uploads tied to events.  
- Notifications when new approved events appear or dates change.  
- Offline capabilities and full PWA polish.

