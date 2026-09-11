import React from 'react';

/** Eyebrow, optional index, display title, optional lede. */
export function SectionHeader({ eyebrow, index, title, lede, style, ...rest }) {
  return (
    <div {...rest} style={style}>
      {(eyebrow || index) && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
          {eyebrow && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                font: 'var(--type-eyebrow)',
                letterSpacing: 'var(--track-eyebrow)',
                textTransform: 'uppercase',
                color: 'var(--red)'
              }}
            >
              <span style={{ width: 5, height: 5, background: 'var(--red)', display: 'block' }} />
              <span>{eyebrow}</span>
            </div>
          )}
          {index && (
            <span style={{ font: 'var(--type-eyebrow)', fontSize: 11, color: 'var(--text-muted)' }}>
              {index}
            </span>
          )}
        </div>
      )}
      <h2
        style={{
          font: 'var(--type-display-l)',
          textTransform: 'uppercase',
          margin: '0 0 12px'
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          style={{
            font: 'var(--type-body)',
            fontSize: 15,
            color: 'var(--text-secondary)',
            maxWidth: 680,
            textWrap: 'pretty',
            margin: 0
          }}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
