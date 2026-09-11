import React from 'react';

/** Square icon-only control. Hairline border, no fill unless active. */
export function IconButton({ label, active, size = 34, style, children, ...rest }) {
  return (
    <button
      {...rest}
      aria-label={label}
      style={{
        cursor: 'pointer',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'var(--red)' : 'transparent',
        color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
        border: active ? 'none' : 'var(--border-width) solid var(--border-raised)',
        padding: 0,
        ...style
      }}
    >
      {children}
    </button>
  );
}
