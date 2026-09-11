import React from 'react';

/**
 * The signature device: a rectangular step cut from the top-left corner with a
 * circular badge nested in the clearance. One per screen, on the flagged item.
 */
export function NotchedCard({
  badge,
  level = 3,
  padding = 'var(--notch-clearance) var(--space-4) var(--space-4)',
  badgeSize = 'var(--notch-badge-size)',
  style,
  children,
  ...rest
}) {
  const surface = level === 2 ? 'var(--e2-surface)' : 'var(--e3-surface)';
  const shadow = level === 2 ? '0 2px 6px rgba(0,0,0,.5)' : '0 6px 18px rgba(0,0,0,.55)';
  // Divergence from upstream v4.0: upstream stretched one SVG to the element
  // box, which scaled the 7px fillet and the corner radii by the card's aspect
  // ratio. --notch-mask is now a fixed-size corner tile plus two fills, so the
  // shorthand is the token alone and the outer rounding moves to border-radius.
  const mask = 'var(--notch-mask)';
  return (
    <div style={{ position: 'relative', ...style }}>
      <div
        {...rest}
        style={{
          background: surface,
          boxShadow: shadow,
          padding,
          borderRadius: '0 var(--notch-radius) var(--notch-radius) var(--notch-radius)',
          WebkitMask: mask,
          mask
        }}
      >
        {children}
      </div>
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--notch-badge-offset)',
            left: 'var(--notch-badge-offset)',
            width: badgeSize,
            height: badgeSize,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--void)',
            border: 'var(--border-width) solid var(--border-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}
