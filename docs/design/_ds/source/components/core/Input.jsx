import React from 'react';

/** Inputs are recessed to E0. They never sit above the plate. */
export function Input({ label, unit, mono, width, style, ...rest }) {
  const field = (
    <input
      {...rest}
      style={{
        width: width || '100%',
        background: 'var(--e0-surface)',
        border: 'var(--border-width) solid var(--e0-border)',
        boxShadow: 'var(--e0-shadow)',
        color: 'var(--text-primary)',
        font: mono ? 'var(--type-data-l)' : 'var(--type-body)',
        padding: '11px 13px',
        outline: 'none',
        ...style
      }}
    />
  );
  return (
    <div>
      {label && (
        <label
          style={{
            display: 'block',
            font: 'var(--type-label)',
            fontSize: 12,
            letterSpacing: 'var(--track-label)',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: 7
          }}
        >
          {label}
        </label>
      )}
      {unit ? (
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {field}
          <span style={{ font: 'var(--type-data)', color: 'var(--text-muted)' }}>{unit}</span>
        </div>
      ) : (
        field
      )}
    </div>
  );
}
