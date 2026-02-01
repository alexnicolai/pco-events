# PCO Events - Project Context

Mobile-first internal web app for tracking Planning Center Calendar events.

## Architecture

- **Next.js 15** with App Router (`src/app/`)
- **Drizzle ORM** with Turso/LibSQL database
- **Planning Center API** for event data (read-only sync)

## Key Files

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Database schema (events, event_meta, coordinators) |
| `src/db/index.ts` | Database client instance |
| `src/lib/pco.ts` | Planning Center API client |
| `drizzle.config.ts` | Drizzle ORM configuration |

## Database Schema

Three tables:
- **events** - Synced from PCO (keyed by PCO event ID)
- **event_meta** - Local status and coordinator assignment
- **coordinators** - List of assignable coordinators

Status values: `not_contacted`, `contacted`, `completed`

## API Patterns

### Planning Center API
- Base URL: `https://api.planningcenteronline.com/calendar/v2`
- Auth: HTTP Basic with `PCO_APP_ID:PCO_SECRET`
- Format: JSON:API 1.0 specification

### Internal API Routes (planned)
- `GET /api/events` - List events with meta
- `GET /api/events/[id]` - Single event details
- `POST /api/sync` - Trigger manual sync
- `PATCH /api/events/[id]/meta` - Update status/coordinator

## Commands

```bash
npm run dev          # Start dev server
npx drizzle-kit push # Push schema to database
npx drizzle-kit studio # Open Drizzle Studio (DB browser)
```

## Current Phase

Phase 0 complete. Next: Phase 1 (PCO Integration Backend)
