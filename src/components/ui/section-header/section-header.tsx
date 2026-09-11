import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './section-header.module.css';

/** Heading levels a section header is ever rendered at. */
type HeadingElement = 'h1' | 'h2' | 'h3';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Uppercase mono kicker, e.g. 'Foundations'. */
  eyebrow?: string;
  /** Mono counter, e.g. '03/09'. */
  index?: string;
  /** Display-face title. Rendered uppercase. */
  title: string;
  /** One-paragraph lede under the title. */
  lede?: string;
  /** The source fixes this at h2. A screen whose section header is its only
   *  heading needs h1, so the level is the caller's to set. Default h2. */
  as?: HeadingElement;
}

/** Eyebrow, optional index, display title, optional lede. */
export function SectionHeader({
  eyebrow,
  index,
  title,
  lede,
  as: Heading = 'h2',
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div {...rest} className={cx(className)}>
      {eyebrow || index ? (
        <div className={styles.meta}>
          {eyebrow ? (
            <div className={styles.eyebrow}>
              <span className={styles.mark} aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          {index ? <span className={styles.index}>{index}</span> : null}
        </div>
      ) : null}

      <Heading className={styles.title}>{title}</Heading>

      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </div>
  );
}
