import { NextResponse } from "next/server";
import { deleteEventTimelineNote } from "@/lib/queries";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id, noteId } = await params;
    const parsedNoteId = Number(noteId);

    if (!Number.isInteger(parsedNoteId) || parsedNoteId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid note id." }, { status: 400 });
    }

    const deleted = await deleteEventTimelineNote(id, parsedNoteId);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Timeline note not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
