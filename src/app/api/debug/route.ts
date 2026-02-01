import { NextResponse } from "next/server";
import { getEvents } from "@/lib/queries";

export async function GET() {
  const events = await getEvents({});

  return NextResponse.json({
    count: events.length,
    sample: events.slice(0, 3).map(e => ({
      id: e.id,
      title: e.title,
      eventType: e.eventType,
      startAt: e.startAt,
      campus: e.campus,
      status: e.status,
    })),
  });
}
