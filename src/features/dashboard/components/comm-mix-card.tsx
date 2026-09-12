import { Surface } from '@/components/ui/surface/surface';
import { formatCount } from '@/features/dashboard/format';
import type { CommMix } from '@/features/dashboard/types';
import styles from './comm-mix-card.module.css';

/** The three comm types, in the order the data model fixes. Their colours are
 *  fixed too, and never remapped. */
const TYPES = [
  { key: 'informative', label: 'INFORMATIVE', swatch: styles.informative },
  { key: 'declarative', label: 'DECLARATIVE', swatch: styles.declarative },
  { key: 'compound', label: 'COMPOUND', swatch: styles.compound },
] as const;

/** The communication-mix count card. Counts rather than the design's percentages:
 *  the backend counts, and a percentage would round a measurement to look tidier. */
export function CommMixCard({ mix }: { mix: CommMix }) {
  const total = mix.calls_classified;

  return (
    <Surface as="section" level={2} behind="var(--void)" padding="var(--space-5)" aria-label="Comm mix">
      <div className={styles.body}>
        <div className={styles.head}>
          <h2 className={styles.title}>Comm mix</h2>
          <span className={styles.total}>{formatCount(total)} CALLS CLASSIFIED</span>
        </div>

        {/* Only the three types are in the proportion bar: they sum to the total,
            while redundant is a flag over it and absence is not a call at all. */}
        <div className={styles.proportion} aria-hidden="true">
          {TYPES.map((type) => (
            <span
              key={type.key}
              className={type.swatch}
              style={{ width: total === 0 ? '0%' : `${(mix[type.key] / total) * 100}%` }}
            />
          ))}
        </div>

        <dl className={styles.rows}>
          {TYPES.map((type) => (
            <div key={type.key} className={styles.row}>
              <span className={`${styles.diamond} ${type.swatch}`} aria-hidden="true" />
              <dt className={styles.label}>{type.label}</dt>
              <dd className={styles.count}>{formatCount(mix[type.key])}</dd>
            </div>
          ))}

          <div className={styles.row}>
            <span className={`${styles.diamond} ${styles.redundant}`} aria-hidden="true" />
            <dt className={styles.label}>REDUNDANT</dt>
            <dd className={styles.count}>{formatCount(mix.redundant)}</dd>
          </div>

          {/* Dead air is an interval that was counted, never a failure. */}
          <div className={styles.row}>
            <span className={styles.absenceSwatch} aria-hidden="true" />
            <dt className={styles.label}>ABSENCE</dt>
            <dd className={styles.count}>{formatCount(mix.absence)} INTERVALS</dd>
          </div>
        </dl>
      </div>
    </Surface>
  );
}
