import styles from './source-caption.module.css';

/** A dot and a mono line saying whether one source is live. Shared by the meter
 *  and the window preview, which the design draws identically under each. */
export function SourceCaption({ live, children }: { live: boolean; children: string }) {
  return (
    <p className={styles.caption} data-live={live ? 'true' : undefined}>
      <span className={styles.mark} aria-hidden="true" />
      {children}
    </p>
  );
}
