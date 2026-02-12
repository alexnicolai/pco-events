import { NextRequest, NextResponse } from "next/server";
import {
  createEventTimelineNote,
  getEventById,
  getEventTimelineNotes,
} from "@/lib/queries";
import { validateTimelineInput } from "@/lib/timeline-notes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notes = await getEventTimelineNotes(id);
    return NextResponse.json({ ok: true, notes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authorName = typeof body.authorName === "string" ? body.authorName : "";
    const note = typeof body.note === "string" ? body.note : "";

    const validationError = validateTimelineInput(authorName, note);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    const created = await createEventTimelineNote(id, authorName.trim(), note.trim());
    return NextResponse.json({ ok: true, note: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
