import React from 'react';

const LEVELS = {
  0: { surface: 'var(--e0-surface)', border: 'var(--e0-border)', shadow: 'var(--e0-shadow)', grooves: 0 },
  1: { surface: 'var(--e1-surface)', border: 'var(--e1-border)', shadow: 'var(--e1-shadow)', grooves: 1 },
  2: { surface: 'var(--e2-surface)', border: 'var(--e2-border)', shadow: 'var(--e2-shadow)', grooves: 2 },
  3: { surface: 'var(--e3-surface)', border: 'var(--e3-border)', shadow: 'var(--e3-shadow)', grooves: 3 },
  4: { surface: 'var(--e4-surface)', border: 'var(--e4-border)', shadow: 'var(--e4-shadow)', grooves: 4 }
};

/**
 * The base plate. Applies one rung of the elevation ladder and, unless told
 * otherwise, the matching run of edge grooves. Groove count IS the level.
 */
export function Surface({
  level = 2,
  grooves,
  behind = 'var(--void)',
  padding = 'var(--space-6)',
  as: Tag = 'div',
  style,
  children,
  ...rest
}) {
  const L = LEVELS[level] || LEVELS[2];
  const count = grooves === undefined ? L.grooves : grooves;
  const slots = [];
  for (let i = 0; i < count; i++) {
    slots.push(
      <span
        key={i}
        style={{
          width: 'var(--groove-width)',
          height: 'var(--groove-depth)',
          background: behind,
          border: `var(--border-width) solid ${L.border}`,
          borderTop: 'none',
          display: 'block'
        }}
      />
    );
  }
  return (
    <Tag
      {...rest}
      style={{
        position: 'relative',
        background: L.surface,
        border: `var(--border-width) solid ${L.border}`,
        boxShadow: L.shadow,
        padding,
        ...style
      }}
    >
      {count > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(var(--border-width) * -1)',
            left: 'var(--groove-inset)',
            display: 'flex',
            gap: 'var(--groove-gap)',
            zIndex: 2
          }}
        >
          {slots}
        </div>
      )}
      {children}
    </Tag>
  );
}
