"use client";

import { useState } from "react";
import type { EventTimelineNote } from "@/db/schema";
import {
  MAX_TIMELINE_AUTHOR_LENGTH,
  MAX_TIMELINE_NOTE_LENGTH,
} from "@/lib/timeline-notes";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface UpdatesProps {
  eventId: string;
  initialNotes: EventTimelineNote[];
}

export function Updates({ eventId, initialNotes }: UpdatesProps) {
  const [notes, setNotes] = useState<EventTimelineNote[]>(initialNotes);
  const [authorName, setAuthorName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedAuthor = authorName.trim();
    const trimmedNote = note.trim();

    if (!trimmedAuthor || !trimmedNote || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/timeline-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: trimmedAuthor,
          note: trimmedNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Unable to post update.");
        return;
      }

      setNotes((prev) => [data.note as EventTimelineNote, ...prev]);
      setNote("");
    } catch {
      setError("Unable to post update.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId: number) {
    if (loading) return;

    const confirmed = window.confirm("Delete this update?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/timeline-notes/${noteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Unable to delete update.");
        return;
      }

      setNotes((prev) => prev.filter((item) => item.id !== noteId));
    } catch {
      setError("Unable to delete update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="timeline-author">Your Name</Label>
          <Input
            id="timeline-author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={MAX_TIMELINE_AUTHOR_LENGTH}
            required
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timeline-note">Update</Label>
          <Textarea
            id="timeline-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={MAX_TIMELINE_NOTE_LENGTH}
            required
            rows={3}
            placeholder="Add an update"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button type="submit" disabled={loading}>
            Post update
          </Button>
          <span className="text-sm text-text-secondary">
            {note.length}/{MAX_TIMELINE_NOTE_LENGTH}
          </span>
        </div>
      </form>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-4 text-sm text-text-secondary">No updates yet.</CardContent>
          </Card>
        ) : (
          notes.map((timelineNote) => (
            <Card key={timelineNote.id} className="bg-bg-card">
              <CardContent className="p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {timelineNote.authorName}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatDateTime(timelineNote.createdAt)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleDelete(timelineNote.id)}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
                <p className="whitespace-pre-wrap text-base text-text-secondary">
                  {timelineNote.note}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
