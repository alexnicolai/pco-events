import { NextRequest, NextResponse } from "next/server";
import { EVENT_LOCATION_OPTIONS, EVENT_STATUSES } from "@/db/schema";
import { updateEventMeta } from "@/lib/queries";

const EVENT_LOCATION_KEYS = new Set(EVENT_LOCATION_OPTIONS.map((option) => option.key));

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.status !== undefined && !EVENT_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (body.eventLocations !== undefined) {
    if (!Array.isArray(body.eventLocations)) {
      return NextResponse.json({ error: "Invalid eventLocations" }, { status: 400 });
    }

    const hasInvalidValue = body.eventLocations.some(
      (value: unknown) => typeof value !== "string" || !EVENT_LOCATION_KEYS.has(value)
    );
    if (hasInvalidValue) {
      return NextResponse.json({ error: "Invalid eventLocations" }, { status: 400 });
    }
  }

  await updateEventMeta(id, {
    status: body.status,
    coordinatorId: body.coordinatorId,
    setupNotes: body.setupNotes,
    estimatedAttendance: body.estimatedAttendance,
    eventLocations:
      body.eventLocations !== undefined ? JSON.stringify(body.eventLocations) : undefined,
    additionalComments: body.additionalComments,
  });

  return NextResponse.json({ ok: true });
}
