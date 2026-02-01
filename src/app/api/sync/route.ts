import { NextResponse } from "next/server";
import { syncEvents, getSyncStatus } from "@/lib/sync";

// Simple in-memory rate limiting
let lastSyncTime = 0;
const MIN_SYNC_INTERVAL_MS = 60 * 1000; // 1 minute minimum between syncs

/**
 * GET /api/sync - Get sync status
 */
export async function GET() {
  try {
    const status = await getSyncStatus();
    return NextResponse.json({
      ok: true,
      ...status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync - Trigger manual sync
 * Rate limited to once per minute
 */
export async function POST() {
  const now = Date.now();

  // Check rate limit
  if (now - lastSyncTime < MIN_SYNC_INTERVAL_MS) {
    const waitSeconds = Math.ceil((MIN_SYNC_INTERVAL_MS - (now - lastSyncTime)) / 1000);
    return NextResponse.json(
      {
        ok: false,
        error: `Rate limited. Please wait ${waitSeconds} seconds before syncing again.`,
      },
      { status: 429 }
    );
  }

  try {
    lastSyncTime = now;
    const result = await syncEvents();

    return NextResponse.json({
      ok: result.errors.length === 0,
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
