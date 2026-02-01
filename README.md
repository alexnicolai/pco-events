# PCO Events

Mobile-first internal web app that reads **approved events** from Planning Center Calendar and adds local status tracking and coordinator assignment.

## Features

- 📅 Syncs approved events from Planning Center Calendar API
- 📱 Mobile-first responsive design
- ✅ Local status tracking (Not Contacted → Contacted → Completed)
- 👤 Coordinator assignment for each event
- 🔄 Daily auto-sync + manual refresh

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Turso (LibSQL/SQLite)
- **ORM**: Drizzle

## Getting Started

### Prerequisites

1. **Planning Center Account** with Calendar access
2. **Turso Account** (free tier available at [turso.tech](https://turso.tech))

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/alexnicolai/pco-events.git
   cd pco-events
   npm install
   ```

2. Create a Planning Center Personal Access Token:
   - Go to [api.planningcenteronline.com/oauth/applications](https://api.planningcenteronline.com/oauth/applications)
   - Create a new Personal Access Token
   - Copy the App ID and Secret

3. Create a Turso database:
   ```bash
   turso db create pco-events
   turso db show pco-events --url      # Copy the URL
   turso db tokens create pco-events   # Copy the token
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

5. Initialize the database:
   ```bash
   npx drizzle-kit push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── db/
│   ├── schema.ts       # Drizzle database schema
│   └── index.ts        # Database client
└── lib/
    └── pco.ts          # Planning Center API client
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PCO_APP_ID` | Planning Center App ID |
| `PCO_SECRET` | Planning Center Secret |
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |

## License

Private - Internal use only
