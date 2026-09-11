/** How the dashboard prints a measurement. No figure is ever rounded to look
 *  tidier, so these only group digits and lay out a duration. */

const COUNT = new Intl.NumberFormat('en-US');

export function formatCount(value: number): string {
  return COUNT.format(value);
}

/** Dead air as `m:ss.mmm`. An interval that was counted, never a failure, so it
 *  keeps every millisecond the server summed. */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/** Shown where the pool produced no value — an unassessed alignment rate, a
 *  median below a population of two. */
export const NO_READING = '—';

const DAY = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  // The server stamps analysis_ready_at in UTC, so the span is read in UTC
  // rather than in whichever timezone the browser happens to sit in.
  timeZone: 'UTC',
});

/** The window the pool covers, or null when the pool is empty. */
export function formatSpan(from: string | null, to: string | null): string | null {
  if (!from || !to) return null;
  const start = DAY.format(new Date(from)).toUpperCase();
  const end = DAY.format(new Date(to)).toUpperCase();
  return start === end ? start : `${start} — ${end}`;
}
