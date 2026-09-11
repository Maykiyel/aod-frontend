import React from 'react';

const TONES = {
  neutral: { color: 'var(--text-secondary)', border: 'var(--border-raised)', bg: 'var(--void)' },
  live: { color: 'var(--cyan)', border: 'rgba(63,225,214,.35)', bg: 'rgba(63,225,214,.1)' },
  alert: { color: 'var(--red)', border: 'rgba(255,46,62,.4)', bg: 'rgba(255,46,62,.12)' },
  aligned: { color: 'var(--aligned)', border: 'rgba(46,213,115,.35)', bg: 'rgba(46,213,115,.1)' },
  informative: { color: 'var(--informative)', border: 'rgba(139,127,255,.35)', bg: 'rgba(139,127,255,.1)' },
  declarative: { color: 'var(--declarative)', border: 'rgba(255,176,32,.35)', bg: 'rgba(255,176,32,.1)' },
  compound: { color: 'var(--compound)', border: 'rgba(255,111,168,.35)', bg: 'rgba(255,111,168,.1)' }
};

/** Mono uppercase tag with a same-hue hairline. Always a measurement or a state. */
export function Tag({ tone = 'neutral', dot, style, children, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'calc(var(--space-2) - 1px)',
        font: 'var(--type-data)',
        fontSize: 11,
        letterSpacing: 'var(--track-tag)',
        padding: '5px 10px',
        color: t.color,
        background: t.bg,
        border: `var(--border-width) solid ${t.border}`,
        ...style
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 'var(--radius-pill)',
            background: t.color,
            animation: 'aod-pulse 1.8s ease-in-out infinite',
            display: 'block'
          }}
        />
      )}
      {children}
    </span>
  );
}
