import type { SVGAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './icon.module.css';

/** The closed set. Ported whole from the vendored Icon.jsx rather than glyph by
 *  glyph: a partial port invites the one-off SVGs the set exists to prevent. */
interface Glyph {
  /** Stroked path. */
  d?: string;
  /** Filled path. */
  solid?: string;
  /** Filled path drawn over the stroked outline. */
  fillPath?: string;
  circle?: number;
  circle2?: number;
  dot?: number;
  dash?: string;
  rect?: [x: number, y: number, width: number, height: number];
  dots?: Array<[x: number, y: number]>;
  spin?: boolean;
}

const GLYPHS = {
  sync: { spin: true, dash: '3.6 3.2', circle: 9 },
  target: { d: 'M7.5 7.5l9 9M16.5 7.5l-9 9', circle: 9 },
  add: { d: 'M12 7.5v9M7.5 12h9', circle: 9 },
  aperture: { circle: 9, dash: '2.5 2.5', dot: 4.5 },
  split: { d: 'M12 3v9l7 4.5M12 12l-8.6 2.6', circle: 9 },
  close: { d: 'M5 5l14 14M19 5L5 19' },
  tracks: { d: 'M3 6.5h18M3 12h18M3 17.5h18' },
  burst: { d: 'M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9' },
  frame: { d: 'M3.5 8V3.5H8M16 3.5h4.5V8M20.5 16v4.5H16M8 20.5H3.5V16' },
  lens: { rect: [3.5, 3.5, 17, 17], circle2: 4 },
  role: {
    d: 'M12 2.5l8.2 4.75v9.5L12 21.5 3.8 16.75v-9.5z',
    fillPath: 'M12 7.5l4 2.3v4.4l-4 2.3-4-2.3V9.8z',
  },
  feed: { d: 'M16 12h5', rect: [3, 7, 13, 10], dots: [[7.5, 12], [12, 12]] },
  filter: { solid: 'M3 4h18l-7 8v8l-4-3v-5z' },
  play: { solid: 'M6 3.5l14 8.5-14 8.5z' },
  flagAdd: { solid: 'M4 20V4l12 7-12 9z', d: 'M17 15h6M20 12v6' },
} as const satisfies Record<string, Glyph>;

export type IconName = keyof typeof GLYPHS;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height'> {
  name: IconName;
  /** Edge length in px. Default 24, the grid the glyphs are drawn on. */
  size?: number;
}

/** The system's closed icon set: machined marks on a 24px grid, 2px stroke.
 *  Takes colour from `currentColor` rather than the source's `color` prop, so a
 *  parent's own states carry the icon with them (ADR 0002). */
export function Icon({ name, size = 24, className, ...rest }: IconProps) {
  const glyph: Glyph = GLYPHS[name];
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

  return (
    <svg
      {...rest}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={rest['aria-label'] ? undefined : 'true'}
      className={cx(glyph.spin ? styles.spin : undefined, className)}
    >
      {glyph.solid ? <path d={glyph.solid} fill="currentColor" /> : null}
      {glyph.fillPath ? <path d={glyph.fillPath} fill="currentColor" /> : null}
      {glyph.circle ? (
        <circle cx="12" cy="12" r={glyph.circle} {...stroke} strokeDasharray={glyph.dash} />
      ) : null}
      {glyph.circle2 ? <circle cx="12" cy="12" r={glyph.circle2} {...stroke} /> : null}
      {glyph.dot ? <circle cx="12" cy="12" r={glyph.dot} fill="currentColor" /> : null}
      {glyph.rect ? (
        <rect x={glyph.rect[0]} y={glyph.rect[1]} width={glyph.rect[2]} height={glyph.rect[3]} {...stroke} />
      ) : null}
      {glyph.dots?.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />)}
      {glyph.d ? <path d={glyph.d} {...stroke} strokeLinecap="square" /> : null}
    </svg>
  );
}
