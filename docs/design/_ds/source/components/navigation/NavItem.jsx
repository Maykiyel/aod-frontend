import React from 'react';

/** Sidebar row. Active state is a steel fill plus a 2px red left edge. */
export function NavItem({ icon, active, label, style, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: active ? '10px 18px' : '10px 18px',
        font: active ? 'var(--type-label)' : 'var(--type-body-s)',
        fontSize: 13,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--steel)' : 'transparent',
        borderLeft: active ? '2px solid var(--red)' : '2px solid transparent',
        cursor: 'pointer',
        ...style
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
