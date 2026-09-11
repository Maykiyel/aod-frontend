import React from 'react';

/**
 * The system's closed icon set — machined marks (rings, nuts, brackets,
 * reticles), 24px grid, 2px stroke, square caps. No generic dashboard glyphs.
 * 'sync' is the only glyph that animates, and only while something is syncing.
 */
const GLYPHS = {
  sync: { spin: true, dash: '3.6 3.2', d: null, circle: 9 },
  target: { d: 'M7.5 7.5l9 9M16.5 7.5l-9 9', circle: 9 },
  add: { d: 'M12 7.5v9M7.5 12h9', circle: 9 },
  aperture: { d: null, circle: 9, dash: '2.5 2.5', dot: 4.5 },
  split: { d: 'M12 3v9l7 4.5M12 12l-8.6 2.6', circle: 9 },
  close: { d: 'M5 5l14 14M19 5L5 19' },
  tracks: { d: 'M3 6.5h18M3 12h18M3 17.5h18' },
  burst: { d: 'M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9' },
  frame: { d: 'M3.5 8V3.5H8M16 3.5h4.5V8M20.5 16v4.5H16M8 20.5H3.5V16' },
  lens: { d: null, rect: [3.5, 3.5, 17, 17], circle2: 4 },
  role: { d: 'M12 2.5l8.2 4.75v9.5L12 21.5 3.8 16.75v-9.5z', fillPath: 'M12 7.5l4 2.3v4.4l-4 2.3-4-2.3V9.8z' },
  feed: { d: 'M16 12h5', rect: [3, 7, 13, 10], dots: [[7.5, 12], [12, 12]] },
  filter: { solid: 'M3 4h18l-7 8v8l-4-3v-5z' },
  play: { solid: 'M6 3.5l14 8.5-14 8.5z' },
  flagAdd: { solid: 'M4 20V4l12 7-12 9z', d: 'M17 15h6M20 12v6' }
};

export function Icon({ name = 'target', size = 24, color = 'currentColor', style, ...rest }) {
  const g = GLYPHS[name] || GLYPHS.target;
  const stroke = { fill: 'none', stroke: color, strokeWidth: 2 };
  return (
    <svg
      {...rest}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ ...(g.spin ? { animation: 'aod-spin 3.4s linear infinite' } : null), ...style }}
    >
      {g.solid && <path d={g.solid} fill={color} />}
      {g.fillPath && <path d={g.fillPath} fill={color} />}
      {g.circle && (
        <circle cx="12" cy="12" r={g.circle} {...stroke} strokeDasharray={g.dash || undefined} />
      )}
      {g.circle2 && <circle cx="12" cy="12" r={g.circle2} {...stroke} />}
      {g.dot && <circle cx="12" cy="12" r={g.dot} fill={color} />}
      {g.rect && <rect x={g.rect[0]} y={g.rect[1]} width={g.rect[2]} height={g.rect[3]} {...stroke} />}
      {g.dots && g.dots.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill={color} />)}
      {g.d && <path d={g.d} {...stroke} strokeLinecap="square" />}
    </svg>
  );
}
