import React from 'react';

const COMM = {
  informative: 'var(--informative)',
  declarative: 'var(--declarative)',
  compound: 'var(--compound)',
  event: 'var(--text-muted)'
};

/**
 * One lane of the canonical timeline. Markers are diamonds coloured strictly by
 * comm type; absence is the only region fill and is always hatched.
 */
export function TimelineTrack({
  label,
  markers = [],
  absence,
  selectedAt,
  labelWidth = 'var(--size-track-label)',
  height = 'var(--size-track-row)',
  style,
  ...rest
}) {
  return (
    <div
      {...rest}
      style={{
        display: 'flex',
        alignItems: 'center',
        height,
        borderTop: 'var(--border-width) solid var(--border-recessed)',
        ...style
      }}
    >
      <div
        style={{
          width: labelWidth,
          flex: 'none',
          font: 'var(--type-data)',
          fontSize: 10.5,
          letterSpacing: '.06em',
          color: 'var(--text-secondary)'
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          height: '100%',
          borderLeft: 'var(--border-width) solid var(--border-soft)'
        }}
      >
        {absence && (
          <span
            style={{
              position: 'absolute',
              top: 5,
              bottom: 5,
              left: absence.from,
              width: absence.width,
              backgroundColor: 'var(--absence-fill)',
              backgroundImage: 'var(--absence-hatch)',
              borderLeft: 'var(--border-width) solid var(--absence)',
              borderRight: 'var(--border-width) solid var(--absence)'
            }}
          />
        )}
        {markers.map((m, i) => (
          <span
            key={i}
            title={m.type}
            style={{
              position: 'absolute',
              top: '50%',
              left: m.at,
              width: 'var(--size-marker)',
              height: 'var(--size-marker)',
              transform: 'translate(-50%,-50%) rotate(45deg)',
              background: COMM[m.type] || COMM.event
            }}
          />
        ))}
        {selectedAt && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: selectedAt.at,
              width: 'var(--size-marker-selected)',
              height: 'var(--size-marker-selected)',
              transform: 'translate(-50%,-50%) rotate(45deg)',
              background: COMM[selectedAt.type] || COMM.compound,
              boxShadow: '0 0 0 4px rgba(255,111,168,.22)'
            }}
          />
        )}
      </div>
    </div>
  );
}
