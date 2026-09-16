import type { ReactNode } from 'react';
import { Surface } from '@/components/ui/surface/surface';
import styles from './rail-panel.module.css';

/** The rail's panel treatment on screens 08 and 09: E2 plate, hex mark, title,
 *  and an optional list of readings. Outside `components/ui`, which is the
 *  sixteen primitives and nothing else (ADR 0001); shared here rather than in a
 *  feature because the lobby and the team-settings module both draw it. */
export function RailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Surface
      as="section"
      level={2}
      behind="var(--void)"
      padding="var(--space-5)"
      aria-label={title}
      className={styles.panel}
    >
      <div className={styles.header}>
        <span className={styles.mark} aria-hidden="true" />
        <h2 className={styles.title}>{title}</h2>
      </div>
      {children}
    </Surface>
  );
}

/** A panel's readings, under the divider the design draws. */
export function RailReadings({ children }: { children: ReactNode }) {
  return <dl className={styles.readings}>{children}</dl>;
}

export function RailReading({ term, value }: { term: string; value: string }) {
  return (
    <div className={styles.reading}>
      <dt className={styles.term}>{term}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}
