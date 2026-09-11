import React from 'react';
import { Surface } from '../core/Surface.jsx';

/** A coach or player note pinned to a timestamp. E2 at rest, E3 when selected. */
export function AnnotationCard({ author, timestamp, body, selected, style, ...rest }) {
  return (
    <Surface
      {...rest}
      level={selected ? 3 : 2}
      behind="var(--ash)"
      padding="11px 12px"
      style={style}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ font: 'var(--type-label)', fontSize: 12 }}>{author}</span>
        <span style={{ font: 'var(--type-micro)', fontSize: 10, color: 'var(--text-muted)' }}>
          {timestamp}
        </span>
      </div>
      <p style={{ font: 'var(--type-body-s)', fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
        {body}
      </p>
    </Surface>
  );
}
