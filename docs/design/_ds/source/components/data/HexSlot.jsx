import React from 'react';

/** Player slot. Hexagonal — there are no circular avatars in this product. */
export function HexSlot({ initials, role, state = 'idle', width = 62, height = 70, style, ...rest }) {
  const states = {
    active: { bg: 'var(--red)', color: 'var(--text-on-accent)' },
    idle: { bg: 'var(--steel-3)', color: 'var(--text-secondary)' },
    offline: { bg: 'var(--e0-surface)', color: 'var(--text-muted)' }
  };
  const s = states[state] || states.idle;
  return (
    <div
      {...rest}
      style={{
        width,
        height,
        background: s.bg,
        color: s.color,
        clipPath: 'var(--clip-hex)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        ...style
      }}
    >
      <span style={{ font: 'var(--type-display-s)', fontSize: Math.round(height * 0.31) }}>
        {initials}
      </span>
      {role && (
        <span style={{ font: 'var(--type-micro)', fontSize: 8.5, letterSpacing: 'var(--track-tag)' }}>
          {role}
        </span>
      )}
    </div>
  );
}
