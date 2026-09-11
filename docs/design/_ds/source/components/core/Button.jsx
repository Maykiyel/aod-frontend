import React from 'react';

/**
 * Primary is the only solid red fill in the system. Secondary carries the
 * single clipped corner. Ghost carries nothing.
 */
export function Button({ variant = 'primary', icon, disabled, style, children, ...rest }) {
  const base = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    font: 'var(--type-data)',
    fontSize: 12,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    padding: '12px 20px',
    border: 'none',
    background: 'transparent',
    opacity: disabled ? .4 : 1,
    transition: 'background 120ms linear, border-color 120ms linear, color 120ms linear'
  };
  const variants = {
    primary: { background: 'var(--red)', color: 'var(--text-on-accent)', fontWeight: 500 },
    secondary: {
      color: 'var(--text-primary)',
      border: 'var(--border-width) solid var(--border-raised)',
      clipPath:
        'polygon(0 0, 100% 0, 100% calc(100% - var(--clip-button)), calc(100% - var(--clip-button)) 100%, 0 100%)'
    },
    ghost: { color: 'var(--text-secondary)', padding: '12px 16px' },
    live: {
      color: 'var(--cyan)',
      border: 'var(--border-width) solid rgba(63,225,214,.4)',
      padding: '11px 16px'
    }
  };
  return (
    <button {...rest} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
}
