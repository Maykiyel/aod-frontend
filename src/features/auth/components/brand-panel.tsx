import { Surface } from '@/components/ui/surface/surface';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import styles from './brand-panel.module.css';

/** Login's left panel: the shared auth plate with the timeline motif in its
 *  slot. The motif is decoration, not data — aria-hidden, positions from the
 *  design reference. */

type CommType = 'informative' | 'declarative' | 'compound';

/** Positions read from `docs/design/01 Log in.dc.html`. */
const MARKERS: Array<{ left: string; type: CommType; selected?: boolean }> = [
  { left: '6%', type: 'informative' },
  { left: '22%', type: 'declarative' },
  { left: '31%', type: 'informative' },
  { left: '44%', type: 'compound', selected: true },
  { left: '52%', type: 'declarative' },
  { left: '74%', type: 'informative' },
  { left: '81%', type: 'compound' },
  { left: '92%', type: 'declarative' },
];

const ABSENCES: Array<{ left: string; width: string }> = [
  { left: '8%', width: '11%' },
  { left: '63%', width: '7%' },
];

const LEGEND: Array<{ label: string; type: CommType }> = [
  { label: 'INFORMATIVE', type: 'informative' },
  { label: 'DECLARATIVE', type: 'declarative' },
  { label: 'COMPOUND', type: 'compound' },
];

export function BrandPanel() {
  return (
    <AuthPanel status="AUTH_GATE">
      <div className={styles.timelineBlock} aria-hidden="true">
        <div className={styles.timelineMeta}>
          <span>TIMELINE_ID:0043-A</span>
          <span>0:00 — 24:00</span>
        </div>

        <Surface level={0} behind="var(--ash)" padding="0">
          <div className={styles.track}>
            <div className={styles.trackLine} />
            <div className={styles.trackLineLower} />

            {ABSENCES.map((absence) => (
              <div
                key={absence.left}
                className={styles.absence}
                style={{ left: absence.left, width: absence.width }}
              >
                <div className={styles.absenceHatch} />
              </div>
            ))}

            {MARKERS.map((marker) => (
              <div
                key={marker.left}
                className={marker.selected ? styles.markerSelected : styles.marker}
                style={{ left: marker.left, background: `var(--${marker.type})` }}
              />
            ))}

            <div className={styles.playhead} />
          </div>
        </Surface>

        <div className={styles.legend}>
          {LEGEND.map((entry) => (
            <span key={entry.label} className={styles.legendItem}>
              <span className={styles.legendMark} style={{ background: `var(--${entry.type})` }} />
              {entry.label}
            </span>
          ))}
          <span className={styles.legendItem}>
            <span className={styles.legendAbsence} />
            ABSENCE
          </span>
        </div>
      </div>
    </AuthPanel>
  );
}
