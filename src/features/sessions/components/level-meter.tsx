import { Surface } from '@/components/ui/surface/surface';
import { SourceCaption } from '@/features/sessions/components/source-caption';
import { useCaptureReading } from '@/lib/capture/hooks';
import type { CaptureRun } from '@/lib/capture/capture';
import styles from './level-meter.module.css';

/** Fourteen, as the design draws. A bar count is a shape, not a measurement. */
const BARS = 14;

/** Each bar's share of the meter, so the row reads as a level rather than as a
 *  spectrum: the leftmost lights first and the rightmost only when it is loud. */
const THRESHOLDS = Array.from({ length: BARS }, (_, index) => (index + 1) / BARS);

const SIGNAL_PRESENT = 'SIGNAL PRESENT — DEVICE LEVEL ONLY';
const NO_SIGNAL = 'NO SIGNAL — DEVICE LEVEL ONLY';

/** Device feedback, so a dead microphone shows up in the first ten seconds
 *  rather than in the report; the caption says so, because nothing here measures
 *  anything. Subscribed here, so the table does not redraw at the meter's rate. */
export function LevelMeter({ run }: { run: CaptureRun }) {
  const reading = useCaptureReading(run);
  const present = reading.microphone && reading.level > 0;

  return (
    <div className={styles.meter}>
      <Surface level={0} behind="var(--e2-surface)" padding="var(--space-3) var(--space-4)">
        <div className={styles.bars} aria-hidden="true">
          {THRESHOLDS.map((threshold) => (
            <span
              key={threshold}
              className={styles.bar}
              data-lit={reading.level >= threshold ? 'true' : undefined}
              data-peak={threshold > 0.75 ? 'true' : undefined}
            />
          ))}
        </div>
      </Surface>

      <SourceCaption live={present}>{present ? SIGNAL_PRESENT : NO_SIGNAL}</SourceCaption>
    </div>
  );
}
