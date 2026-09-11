import React from 'react';

/**
 * Structural chrome with machined-plate character: stepped silhouette at 5.5%
 * white, a faint ring, and bolt dots at the corners.
 */
export function PlateFrame({
  level = 1,
  corner = 'bottom-left',
  ring = true,
  padding = 'var(--space-6)',
  style,
  children,
  ...rest
}) {
  const surface = level === 0 ? 'var(--e0-surface)' : level === 2 ? 'var(--e2-surface)' : 'var(--e1-surface)';
  const border = level === 0 ? 'var(--e0-border)' : level === 2 ? 'var(--border)' : 'var(--border-soft)';
  const shadow = level === 0 ? 'var(--e0-shadow)' : level === 2 ? 'var(--e2-shadow)' : 'var(--e1-shadow)';
  const pos = {
    'bottom-left': { left: -30, bottom: -24 },
    'bottom-right': { right: -40, bottom: -30 },
    'top-right': { right: -46, top: -30 }
  }[corner];
  const dot = {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 'var(--radius-pill)',
    background: 'var(--plate-bolt)'
  };
  return (
    <div
      {...rest}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: surface,
        border: `var(--border-width) solid ${border}`,
        boxShadow: shadow,
        padding,
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 190,
          height: 140,
          background: 'var(--plate-silhouette)',
          clipPath:
            'polygon(0 30%, 26% 30%, 34% 10%, 72% 10%, 84% 32%, 100% 32%, 100% 100%, 48% 100%, 40% 72%, 0 72%)',
          ...pos
        }}
      />
      {ring && (
        <div
          style={{
            position: 'absolute',
            width: 110,
            height: 110,
            border: 'var(--border-width) solid var(--plate-ring)',
            borderRadius: 'var(--radius-pill)',
            ...pos,
            ...(pos.left !== undefined ? { left: pos.left + 50 } : {}),
            ...(pos.bottom !== undefined ? { bottom: pos.bottom + 34 } : {})
          }}
        />
      )}
      <span style={{ ...dot, top: 7, left: 7 }} />
      <span style={{ ...dot, top: 7, right: 7 }} />
      <span style={{ ...dot, bottom: 7, left: 7 }} />
      <span style={{ ...dot, bottom: 7, right: 7 }} />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}
