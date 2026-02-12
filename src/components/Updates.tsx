"use client";

import { useState } from "react";
import type { EventTimelineNote } from "@/db/schema";
import {
  MAX_TIMELINE_AUTHOR_LENGTH,
  MAX_TIMELINE_NOTE_LENGTH,
} from "@/lib/timeline-notes";

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
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
        <div>
          <label
            htmlFor="timeline-author"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            Your Name
          </label>
          <input
            id="timeline-author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={MAX_TIMELINE_AUTHOR_LENGTH}
            required
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="timeline-note"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            Update
          </label>
          <textarea
            id="timeline-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={MAX_TIMELINE_NOTE_LENGTH}
            required
            rows={3}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            placeholder="Add an update"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Post update
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {note.length}/{MAX_TIMELINE_NOTE_LENGTH}
          </span>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No updates yet.
          </div>
        ) : (
          notes.map((timelineNote) => (
            <article
              key={timelineNote.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {timelineNote.authorName}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(timelineNote.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(timelineNote.id)}
                  disabled={loading}
                  className="text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {timelineNote.note}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
