import { formatDay } from '@/utils/format-date';

/** How the dashboard prints a measurement. No figure is ever rounded to look
 *  tidier, so these only group digits and lay out a duration. */

const COUNT = new Intl.NumberFormat('en-US');

/** Groups digits without rounding: a measurement keeps the precision it came with. */
const COUNT_EXACT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 });

export function formatCount(value: number): string {
  return COUNT.format(value);
}

/** Dead air in seconds, the system's own idiom for it (`ABSENCE 6.4s`). The
 *  design's `4:12` under a `min` label contradicts itself, and m:ss carries no
 *  honest unit; every millisecond the server summed is kept either way. */
export function formatSeconds(ms: number): string {
  return COUNT_EXACT.format(ms / 1000);
}

/** Shown where the pool produced no value — an unassessed alignment rate, a
 *  median below a population of two. */
export const NO_READING = '—';

/** The window the pool covers, or null when the pool is empty. */
export function formatSpan(from: string | null, to: string | null): string | null {
  if (!from || !to) return null;
  const start = formatDay(from);
  const end = formatDay(to);
  return start === end ? start : `${start} — ${end}`;
}
