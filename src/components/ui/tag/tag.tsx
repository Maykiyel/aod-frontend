import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './tag.module.css';

/** Hue. The comm-type tones are fixed by the data model and never remapped. */
export type TagTone =
  | 'neutral'
  | 'live'
  | 'alert'
  | 'aligned'
  | 'informative'
  | 'declarative'
  | 'compound';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Default 'neutral'. */
  tone?: TagTone;
  /** A pulsing status dot. Only for genuinely live state — a decorative pulse
   *  trains people to ignore it. Default false. */
  dot?: boolean;
}

const TONE_CLASS: Record<TagTone, string> = {
  neutral: styles.neutral,
  live: styles.live,
  alert: styles.alert,
  aligned: styles.aligned,
  informative: styles.informative,
  declarative: styles.declarative,
  compound: styles.compound,
};

/** Mono uppercase tag with a same-hue hairline: always a state or a measurement,
 *  never a decorative label. `dot` stays a boolean because the design system's
 *  own API declares it one — a variant component per hue would be seven. */
export function Tag({ tone = 'neutral', dot = false, className, children, ...rest }: TagProps) {
  return (
    <span {...rest} className={cx(styles.tag, TONE_CLASS[tone], className)}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
