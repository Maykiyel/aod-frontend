import React from 'react';

/** The disc that nests in a notch, or marks a comm type inline. */
export function Badge({ size = 28, tone = 'var(--red)', hollow = true, style, children, ...rest }) {
  return (
    <span
      {...rest}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-pill)',
        background: hollow ? 'var(--void)' : tone,
        border: hollow ? 'var(--border-width) solid var(--border-raised)' : 'none',
        color: hollow ? tone : 'var(--text-on-accent)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        ...style
      }}
    >
      {children}
    </span>
  );
}
