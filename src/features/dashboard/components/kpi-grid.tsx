import { StatBar } from '@/components/ui/stat-bar/stat-bar';
import { formatCount, formatDuration, NO_READING } from '@/features/dashboard/format';
import type { CommunicationKpi } from '@/features/dashboard/types';
import styles from './kpi-grid.module.css';

/** The Communication KPI card: four readings pooled over the session pool, in the
 *  2x2 grid screens 06 and 07 draw. Absence is the one red bar in the group. */
export function KpiGrid({ kpi }: { kpi: CommunicationKpi }) {
  return (
    <section className={styles.grid} aria-label="Communication KPI">
      <StatBar label="COMM FREQUENCY" value={kpi.comm_frequency} unit="/min" />
      {/* A rate derived from hedged valence readings, never an accuracy. */}
      <StatBar
        label="ALIGNMENT RATE"
        value={kpi.alignment_rate ?? NO_READING}
        unit={kpi.alignment_rate === null ? undefined : '%'}
        fill="aligned"
      />
      <StatBar label="ABSENCE TOTAL" value={formatDuration(kpi.absence_ms)} unit="min" fill="red" />
      <StatBar label="CALLS CLASSIFIED" value={formatCount(kpi.calls_classified)} unit="calls" />
    </section>
  );
}
