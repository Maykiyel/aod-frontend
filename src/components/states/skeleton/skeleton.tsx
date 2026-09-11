import { Surface } from '@/components/ui/surface/surface';
import styles from './skeleton.module.css';

export interface SkeletonProps {
  /** Bars to draw. Default 3. */
  lines?: number;
  /** What is being waited on, as a screen reader announces it. */
  label?: string;
}

/** The loading treatment, built once here rather than improvised per screen.
 *  E0 with no grooves: a groove is a cut showing the plate underneath, and there
 *  is nothing underneath a well (#14). */
export function Skeleton({ lines = 3, label = 'Loading' }: SkeletonProps) {
  return (
    <Surface level={0} role="status" aria-label={label}>
      <div className={styles.bars} aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className={styles.bar} />
        ))}
      </div>
    </Surface>
  );
}
