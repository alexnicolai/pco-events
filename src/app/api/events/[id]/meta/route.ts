import { NextRequest, NextResponse } from "next/server";
import { EVENT_LOCATION_OPTIONS, EVENT_STATUSES } from "@/db/schema";
import { updateEventMeta, createEventTimelineNote, getCoordinatorById, getEventMeta } from "@/lib/queries";

const EVENT_LOCATION_KEYS = new Set<string>(EVENT_LOCATION_OPTIONS.map((option) => option.key));

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

  const detailFieldKeys = ["setupNotes", "estimatedAttendance", "eventLocations", "additionalComments"];
  const hasDetailFields = detailFieldKeys.some((f) => f in body);

  // Fetch existing meta before the update so we can diff detail fields
  const existingMeta = hasDetailFields ? await getEventMeta(id) : null;

  await updateEventMeta(id, {
    status: body.status,
    coordinatorId: body.coordinatorId,
    setupNotes: body.setupNotes,
    estimatedAttendance: body.estimatedAttendance,
    eventLocations:
      body.eventLocations !== undefined ? JSON.stringify(body.eventLocations) : undefined,
    additionalComments: body.additionalComments,
  });

  const activityNotes: string[] = [];

  if (body.status !== undefined) {
    const label = body.status === "contacted" ? "Contacted" : "Not Contacted";
    activityNotes.push(`Status changed to ${label}`);
  }

  if ("coordinatorId" in body) {
    if (body.coordinatorId === null) {
      activityNotes.push("Coordinator removed");
    } else {
      const coordinator = await getCoordinatorById(body.coordinatorId);
      activityNotes.push(coordinator ? `Coordinator assigned: ${coordinator.name}` : "Coordinator assigned");
    }
  }

  if (hasDetailFields) {
    const textFields: Array<{ key: "setupNotes" | "estimatedAttendance" | "additionalComments"; label: string }> = [
      { key: "setupNotes", label: "Setup notes" },
      { key: "estimatedAttendance", label: "Estimated number of people attending" },
      { key: "additionalComments", label: "Additional comments" },
    ];

    for (const { key, label } of textFields) {
      if (key in body) {
        const oldValue: string | null = existingMeta?.[key] ?? null;
        const newValue: string | null = body[key];
        if (newValue !== oldValue) {
          activityNotes.push(newValue ? `${label}: ${newValue}` : `${label}: (cleared)`);
        }
      }
    }

    if ("eventLocations" in body) {
      const oldKeys: string[] = (() => {
        try { return existingMeta?.eventLocations ? JSON.parse(existingMeta.eventLocations) : []; }
        catch { return []; }
      })();
      const newKeys: string[] = body.eventLocations;
      if ([...oldKeys].sort().join(",") !== [...newKeys].sort().join(",")) {
        if (newKeys.length === 0) {
          activityNotes.push("Event locations: (cleared)");
        } else {
          const labels = newKeys.map((k: string) => EVENT_LOCATION_OPTIONS.find((o) => o.key === k)?.label ?? k);
          activityNotes.push(`Event locations: ${labels.join(", ")}`);
        }
      }
    }
  }

  for (const noteText of activityNotes) {
    await createEventTimelineNote(id, "System", noteText);
  }

  return NextResponse.json({ ok: true });
}
