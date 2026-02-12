"use client";

import { useMemo, useState } from "react";
import { EVENT_LOCATION_OPTIONS, type EventLocation } from "@/db/schema";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-1">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{label}</p>
      <div className="text-base text-zinc-900 dark:text-zinc-100">{value}</div>
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
    return EVENT_LOCATION_OPTIONS.filter((option) => saved.eventLocations.includes(option.key)).map(
      (option) => option.label
    );
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
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Event Details
        </CardTitle>
        {!isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="space-y-4">
            <DetailRow label="When you&apos;re setting up" value={saved.setupNotes || "Not set"} />
            <DetailRow
              label="Estimated number of people attending"
              value={saved.estimatedAttendance || "Not set"}
            />
            <DetailRow
              label="Where will the event be held?"
              value={
                selectedLocationLabels.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
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
            <div className="space-y-1.5">
              <Label htmlFor="setup-notes">When you&apos;re setting up</Label>
              <Textarea
                id="setup-notes"
                value={draft.setupNotes}
                onChange={(event) => setDraft((prev) => ({ ...prev, setupNotes: event.target.value }))}
                rows={3}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attendance">Estimated number of people attending</Label>
              <Input
                id="attendance"
                type="text"
                value={draft.estimatedAttendance}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, estimatedAttendance: event.target.value }))
                }
                disabled={isSaving}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Where will the event be held?
              </legend>
              <div className="space-y-2">
                {EVENT_LOCATION_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-start gap-2 rounded-lg p-1 text-base text-zinc-800 dark:text-zinc-200"
                  >
                    <input
                      type="checkbox"
                      checked={draft.eventLocations.includes(option.key)}
                      onChange={(event) => toggleLocation(option.key, event.target.checked)}
                      disabled={isSaving}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-900"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="additional-comments">Additional Comments</Label>
              <Textarea
                id="additional-comments"
                value={draft.additionalComments}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, additionalComments: event.target.value }))
                }
                rows={3}
                disabled={isSaving}
              />
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
