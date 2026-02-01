import { NextRequest, NextResponse } from "next/server";
import { syncEvents } from "@/lib/sync";

/**
 * GET /api/cron - Daily sync triggered by Vercel Cron
 *
 * This endpoint is called by Vercel's cron scheduler.
 * It verifies the CRON_SECRET to ensure only Vercel can trigger it.
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify it
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("[Cron] Starting daily sync...");
    const startTime = Date.now();

    const result = await syncEvents();

    const duration = Date.now() - startTime;
    console.log(
      `[Cron] Sync completed in ${duration}ms: ` +
        `created=${result.created}, updated=${result.updated}, deleted=${result.deleted}`
    );

    if (result.errors.length > 0) {
      console.error("[Cron] Sync errors:", result.errors);
    }

    return NextResponse.json({
      ok: result.errors.length === 0,
      ...result,
      durationMs: duration,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Cron] Sync failed:", message);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
