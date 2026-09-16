/** UTC, because the server stamps every timestamp in UTC and a reading should
 *  not shift with whichever timezone the browser happens to sit in. */
const DAY = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A date as the copy rules print one: `SEP 16, 2026`, or an em dash where the
 *  server sent none. */
export function formatDay(iso: string | null): string {
  return iso ? DAY.format(new Date(iso)).toUpperCase() : '—';
}
