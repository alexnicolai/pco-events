import { NextRequest, NextResponse } from "next/server";
import { EVENT_STATUSES } from "@/db/schema";
import { updateEventMeta } from "@/lib/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.status !== undefined && !EVENT_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateEventMeta(id, {
    status: body.status,
    coordinatorId: body.coordinatorId,
  });

  return NextResponse.json({ ok: true });
}
