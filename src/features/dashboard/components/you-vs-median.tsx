import { useId } from 'react';
import { formatCount, NO_READING } from '@/features/dashboard/format';
import type { OwnLine, TeamMedian } from '@/features/dashboard/types';
import styles from './you-vs-median.module.css';

interface Comparison {
  label: string;
  mine: number | null;
  median: number | null;
  /** Printed after each figure, e.g. '/min'. */
  unit: string;
  /** The bar fill for this metric; only one in the card is the aligned green. */
  fill: string;
  /** What both bars are drawn against. */
  ceiling: number;
}

/** Bars are drawn against the larger reading plus a quarter again, so the longer
 *  of the two lands near four fifths of the track instead of filling it — a bar
 *  pinned to 100% says nothing about the comparison. */
function withHeadroom(mine: number | null, median: number | null): number {
  return Math.max(mine ?? 0, median ?? 0) * 1.25;
}

function reading(value: number | null, unit: string): string {
  return value === null ? NO_READING : `${formatCount(value)}${unit}`;
}

/** One metric, as a figure: the player's own reading, the team median beside it,
 *  and a bar with the median marked on it. */
function ComparisonRow({ label, mine, median, unit, fill, ceiling }: Comparison) {
  const captionId = useId();
  const share = (value: number | null) => (ceiling === 0 || value === null ? 0 : value / ceiling);

  return (
    <figure className={styles.row} aria-labelledby={captionId}>
      <div className={styles.line}>
        <figcaption id={captionId} className={styles.label}>
          {label}
        </figcaption>
        <span className={styles.figures}>
          <span className={styles.mine}>{reading(mine, unit)}</span>
          <span className={styles.median}>MEDIAN {reading(median, unit)}</span>
        </span>
      </div>

      {/* A meter rather than a decoration: the bar carries the reading against
          its scale, so it is worth something to a screen reader too. */}
      <div
        className={styles.track}
        role="meter"
        aria-labelledby={captionId}
        aria-valuenow={mine ?? 0}
        aria-valuemin={0}
        aria-valuemax={ceiling}
        aria-valuetext={`${reading(mine, unit)}, team median ${reading(median, unit)}`}
      >
        <span className={styles.bar} style={{ width: `${share(mine) * 100}%`, background: fill }} />
        {median === null ? null : (
          <span className={styles.tick} style={{ left: `${share(median) * 100}%` }} />
        )}
      </div>
    </figure>
  );
}

interface YouVsMedianProps {
  you: OwnLine;
  teamMedian: TeamMedian;
}

/**
 * What a player is shown in place of the roster. Three metrics, not the design's
 * four: dead air is team-wide by definition, so there is no personal absence
 * figure to compare (ADR 0011 puts one out of scope).
 */
export function YouVsMedian({ you, teamMedian }: YouVsMedianProps) {
  const comparisons: Comparison[] = [
    {
      label: 'COMM FREQUENCY',
      mine: you.comm_frequency,
      median: teamMedian.comm_frequency,
      unit: '/min',
      fill: 'var(--text-primary)',
      ceiling: withHeadroom(you.comm_frequency, teamMedian.comm_frequency),
    },
    {
      label: 'ALIGNMENT RATE',
      mine: you.alignment_rate,
      median: teamMedian.alignment_rate,
      unit: '%',
      fill: 'var(--aligned)',
      // A rate is already on a fixed scale, so it is drawn against 100.
      ceiling: 100,
    },
    {
      label: 'CALLS LOGGED',
      mine: you.calls_logged,
      median: teamMedian.calls_logged,
      unit: '',
      fill: 'var(--text-primary)',
      ceiling: withHeadroom(you.calls_logged, teamMedian.calls_logged),
    },
  ];

  return (
    <section className={styles.card} aria-label="You vs team median">
      <div className={styles.head}>
        <h2 className={styles.title}>You vs team median</h2>
        <span className={styles.note}>MEDIAN OVER THE ANALYSED SESSIONS</span>
      </div>

      {comparisons.map((comparison) => (
        <ComparisonRow key={comparison.label} {...comparison} />
      ))}

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendBar} aria-hidden="true" />
          YOU
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendTick} aria-hidden="true" />
          TEAM MEDIAN
        </span>
      </div>
    </section>
  );
}
