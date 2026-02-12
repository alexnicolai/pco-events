export const MAX_TIMELINE_AUTHOR_LENGTH = 100;
export const MAX_TIMELINE_NOTE_LENGTH = 2000;

export function validateTimelineInput(authorName: string, note: string): string | null {
  const trimmedAuthor = authorName.trim();
  const trimmedNote = note.trim();

  if (!trimmedAuthor) return "Author name is required.";
  if (!trimmedNote) return "Note is required.";
  if (trimmedAuthor.length > MAX_TIMELINE_AUTHOR_LENGTH) {
    return `Author name must be ${MAX_TIMELINE_AUTHOR_LENGTH} characters or fewer.`;
  }
  if (trimmedNote.length > MAX_TIMELINE_NOTE_LENGTH) {
    return `Note must be ${MAX_TIMELINE_NOTE_LENGTH} characters or fewer.`;
  }

  return null;
}
