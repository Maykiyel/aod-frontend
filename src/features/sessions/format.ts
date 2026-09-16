/** Shown where the server sent no value. */
const NO_READING = '—';

// UTC, because the server stamps created_at in UTC and a session's date should
// not shift with the reader's timezone. The dashboard's span formatter is its
// own; a feature never imports another feature (conventions.md).
const DAY = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** The day a Session was created, uppercase: `SEP 16, 2026`. */
export function formatSessionDate(iso: string | null): string {
  return iso ? DAY.format(new Date(iso)).toUpperCase() : NO_READING;
}

/** How far a processing Session's transcription has got. Failed transcripts are
 *  named rather than hidden: they still count as done, and the figure would
 *  otherwise stall short of its total with no explanation. */
export function formatTranscription(progress: {
  total: number;
  completed: number;
  failed: number;
}): string {
  const done = progress.completed + progress.failed;
  const failed = progress.failed > 0 ? `, ${progress.failed} FAILED` : '';
  return `TRANSCRIBED ${done} OF ${progress.total}${failed}`;
}
