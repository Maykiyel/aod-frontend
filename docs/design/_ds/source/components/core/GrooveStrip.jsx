import React from 'react';

/**
 * A standalone run of edge-groove slots. Use for page-level section dividers,
 * or on a surface that cannot host Surface's own strip.
 */
export function GrooveStrip({
  count = 2,
  behind = 'var(--void)',
  borderColor = 'var(--border-soft)',
  width = 'var(--groove-divider-width)',
  depth = 'var(--groove-divider-depth)',
  inset = '0',
  divider = false,
  style,
  ...rest
}) {
  const slots = [];
  for (let i = 0; i < count; i++) {
    slots.push(
      <span
        key={i}
        style={{
          width,
          height: depth,
          background: behind,
          border: `var(--border-width) solid ${borderColor}`,
          borderTop: 'none',
          display: 'block'
        }}
      />
    );
  }
  return (
    <div
      {...rest}
      style={{
        position: 'relative',
        borderTop: divider ? `var(--border-width) solid ${borderColor}` : 'none',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 'calc(var(--border-width) * -1)',
          left: inset,
          display: 'flex',
          gap: 'var(--groove-gap)'
        }}
      >
        {slots}
      </div>
    </div>
  );
}
