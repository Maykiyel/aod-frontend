import React from 'react';

const FILLS = {
  red: { bg: 'var(--red)', color: 'var(--text-on-accent)' },
  white: { bg: 'var(--text-primary)', color: 'var(--text-on-light)' },
  aligned: { bg: 'var(--aligned)', color: 'var(--text-on-light)' }
};

/**
 * One rectangle split by a diagonal seam: recessed label on the left,
 * solid-filled value on the right. The halves interlock with no gap.
 */
export function StatBar({
  label,
  value,
  unit,
  fill = 'white',
  height = 44,
  valueWidth = 150,
  skew = 'var(--clip-statbar-skew)',
  style,
  ...rest
}) {
  const f = FILLS[fill] || FILLS.white;
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'stretch', height, ...style }}>
      <div
        style={{
          flex: 1,
          background: 'var(--e0-surface)',
          border: 'var(--border-width) solid var(--e0-border)',
          display: 'flex',
          alignItems: 'center',
          padding: `0 calc(${skew} + 4px) 0 14px`,
          clipPath: `polygon(0 0, 100% 0, calc(100% - ${skew}) 100%, 0 100%)`,
          font: 'var(--type-data)',
          fontSize: 11.5,
          letterSpacing: '.12em',
          color: 'var(--text-secondary)'
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: `calc(${valueWidth}px + ${skew})`,
          marginLeft: `calc(${skew} * -1)`,
          clipPath: `polygon(${skew} 0, 100% 0, 100% 100%, 0 100%)`,
          background: f.bg,
          color: f.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 16px',
          font: 'var(--type-stat)',
          fontSize: Math.round(height * 0.68)
        }}
      >
        {value}
        {unit && (
          <span style={{ font: 'var(--type-data)', fontSize: 13, marginLeft: 5 }}>{unit}</span>
        )}
      </div>
    </div>
  );
}
