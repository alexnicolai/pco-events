"use client";

import { useMemo, useState } from "react";
import {
  EVENT_LOCATION_OPTIONS,
  type EventLocation,
} from "@/db/schema";

interface EventDetailsSectionProps {
  eventId: string;
  setupNotes: string | null;
  estimatedAttendance: string | null;
  eventLocationsJson: string | null;
  additionalComments: string | null;
}

interface EventDetailsFormState {
  setupNotes: string;
  estimatedAttendance: string;
  eventLocations: EventLocation[];
  additionalComments: string;
}

function parseEventLocations(value: string | null): EventLocation[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    const validKeys = new Set(EVENT_LOCATION_OPTIONS.map((option) => option.key));
    return parsed.filter(
      (item: unknown): item is EventLocation =>
        typeof item === "string" && validKeys.has(item as EventLocation)
    );
  } catch {
    return [];
  }
}

function toFormState(
  setupNotes: string | null,
  estimatedAttendance: string | null,
  eventLocationsJson: string | null,
  additionalComments: string | null
): EventDetailsFormState {
  return {
    setupNotes: setupNotes ?? "",
    estimatedAttendance: estimatedAttendance ?? "",
    eventLocations: parseEventLocations(eventLocationsJson),
    additionalComments: additionalComments ?? "",
  };
}

function toNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
      <div className="text-sm text-zinc-800 dark:text-zinc-200">{value}</div>
    </div>
  );
}

export function EventDetailsSection({
  eventId,
  setupNotes,
  estimatedAttendance,
  eventLocationsJson,
  additionalComments,
}: EventDetailsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<EventDetailsFormState>(
    toFormState(setupNotes, estimatedAttendance, eventLocationsJson, additionalComments)
  );
  const [draft, setDraft] = useState<EventDetailsFormState>(saved);

  const selectedLocationLabels = useMemo(() => {
    const labels = EVENT_LOCATION_OPTIONS.filter((option) =>
      saved.eventLocations.includes(option.key)
    ).map((option) => option.label);
    return labels;
  }, [saved.eventLocations]);

  function handleEdit() {
    setDraft(saved);
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraft(saved);
    setError(null);
    setIsEditing(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/meta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupNotes: toNullableText(draft.setupNotes),
          estimatedAttendance: toNullableText(draft.estimatedAttendance),
          eventLocations: draft.eventLocations,
          additionalComments: toNullableText(draft.additionalComments),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Event Details");
      }

      setSaved(draft);
      setIsEditing(false);
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleLocation(location: EventLocation, checked: boolean) {
    setDraft((prev) => {
      const locations = checked
        ? [...prev.eventLocations, location]
        : prev.eventLocations.filter((item) => item !== location);

      return {
        ...prev,
        eventLocations: locations,
      };
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Event Details
        </h3>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <DetailRow label="When you're setting up" value={saved.setupNotes || "Not set"} />
          <DetailRow
            label="Estimated number of people attending"
            value={saved.estimatedAttendance || "Not set"}
          />
          <DetailRow
            label="Where will the event be held?"
            value={
              selectedLocationLabels.length > 0 ? (
                <ul className="list-disc list-inside">
                  {selectedLocationLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : (
                "Not set"
              )
            }
          />
          <DetailRow label="Additional Comments" value={saved.additionalComments || "Not set"} />
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              When you&apos;re setting up
            </span>
            <textarea
              value={draft.setupNotes}
              onChange={(event) => setDraft((prev) => ({ ...prev, setupNotes: event.target.value }))}
              rows={3}
              disabled={isSaving}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Estimated number of people attending
            </span>
            <input
              type="text"
              value={draft.estimatedAttendance}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, estimatedAttendance: event.target.value }))
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Where will the event be held?
            </legend>
            <div className="space-y-2">
              {EVENT_LOCATION_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200"
                >
                  <input
                    type="checkbox"
                    checked={draft.eventLocations.includes(option.key)}
                    onChange={(event) => toggleLocation(option.key, event.target.checked)}
                    disabled={isSaving}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Additional Comments
            </span>
            <textarea
              value={draft.additionalComments}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, additionalComments: event.target.value }))
              }
              rows={3}
              disabled={isSaving}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex h-10 items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
