import { Surface } from '@/components/ui/surface/surface';
import styles from './brand-panel.module.css';

/** Left-hand plate on the auth screens. The timeline motif is decoration, not
 *  data — aria-hidden, positions from the design reference. A feature component
 *  rather than part of the route because sign-up (#4) reuses it. */

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
    <div className={styles.panel}>
      <Surface level={1} behind="var(--void)" padding="0" className={styles.plate}>
        <div className={styles.inner}>
          <div className={styles.statusRow}>
            <span className={styles.status}>
              <span className={styles.statusMark} />
              AUTH_GATE
            </span>
            <span className={styles.build}>BUILD:4.0.2</span>
          </div>

          <div className={styles.brand}>
            <div className={styles.wordmark}>
              <div>Beyond</div>
              <div className={styles.wordmarkRow}>
                <span>Mechanics</span>
                <span className={styles.rule} />
              </div>
            </div>
            <p className={styles.strapline}>
              AUDIO-BASED COMMUNICATION ANALYSIS FOR ESPORTS TEAMS
            </p>
          </div>

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
                  <span
                    className={styles.legendMark}
                    style={{ background: `var(--${entry.type})` }}
                  />
                  {entry.label}
                </span>
              ))}
              <span className={styles.legendItem}>
                <span className={styles.legendAbsence} />
                ABSENCE
              </span>
            </div>
          </div>
        </div>
      </Surface>

      {/* Machined-plate silhouettes and corner bolts. Purely decorative. */}
      <div className={styles.plateEdge} />
      <div className={styles.plateEdgeInner} />
      <div className={styles.plateFoot} />
      <span className={`${styles.bolt} ${styles.boltTopLeft}`} />
      <span className={`${styles.bolt} ${styles.boltTopRight}`} />
      <span className={`${styles.bolt} ${styles.boltBottomLeft}`} />
      <span className={`${styles.bolt} ${styles.boltBottomRight}`} />
    </div>
  );
}
