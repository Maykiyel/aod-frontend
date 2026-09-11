import type { ReactNode } from 'react';
import { SectionHeader } from '@/components/ui/section-header/section-header';
import { Surface } from '@/components/ui/surface/surface';
import styles from './empty-state.module.css';

export interface EmptyStateProps {
  /** Uppercase mono kicker. */
  eyebrow?: string;
  title: string;
  /** The monospaced line under the title — a count, a status, an identifier. */
  reading?: string;
  /** Instruction and any action. Composed as children rather than as props, so
   *  a screen with nothing to offer simply passes none. */
  children?: ReactNode;
}

/** The empty treatment: a section header, a monospaced line, and whatever the
 *  screen says next (#14). E2, the working level — an empty state is a module
 *  that happens to have nothing in it, not a lesser surface. */
export function EmptyState({ eyebrow, title, reading, children }: EmptyStateProps) {
  return (
    <Surface level={2} behind="var(--void)">
      <div className={styles.body}>
        <SectionHeader eyebrow={eyebrow} title={title} />
        {reading ? <span className={styles.reading}>{reading}</span> : null}
        {children}
      </div>
    </Surface>
  );
}

/** The instruction line inside an empty state, styled once so seventeen screens
 *  do not each pick their own. */
export function EmptyStateInstruction({ children }: { children: ReactNode }) {
  return <p className={styles.instruction}>{children}</p>;
}
