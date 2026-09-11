import React from 'react';
import { Surface } from '../../components/core/Surface.jsx';
import { Button } from '../../components/core/Button.jsx';
import { Tag } from '../../components/core/Tag.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { StatBar } from '../../components/data/StatBar.jsx';
import { HexSlot } from '../../components/data/HexSlot.jsx';
import { SectionHeader } from '../../components/navigation/SectionHeader.jsx';

const SESSIONS = [
  { id: 'SESSION_047', map: 'MAP_ASCENT', round: 'Round 14', freq: '18.4', gaps: '6', state: 'reviewing' },
  { id: 'SESSION_046', map: 'MAP_LOTUS', round: 'Round 21', freq: '14.1', gaps: '9', state: 'open' },
  { id: 'SESSION_045', map: 'MAP_SPLIT', round: 'Round 08', freq: '21.7', gaps: '3', state: 'signed' }
];

export function SessionsList({ onOpen }) {
  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 26 }}>
        <SectionHeader eyebrow="Sentinel Academy" title="Sessions" lede="Three scrims awaiting coordination review." />
        <Button icon={<Icon name="add" size={14} color="#fff" />}>New session</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {SESSIONS.map(s => (
          <Surface key={s.id} level={2} behind="var(--void)" padding="0" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                height: 116,
                background: 'var(--well)',
                borderBottom: 'var(--border-width) solid var(--border)',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, var(--clip-thumbnail) 100%, 0 calc(100% - var(--clip-thumbnail)))',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: 14
              }}
            >
              <span style={{ position: 'absolute', top: 12, right: 14, font: 'var(--type-micro)', color: 'var(--text-muted)' }}>{s.map}</span>
              <span style={{ font: 'var(--type-display-s)', textTransform: 'uppercase' }}>{s.round}</span>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag>{s.id}</Tag>
                {s.state === 'reviewing' && <Tag tone="live" dot>REVIEWING</Tag>}
                {s.state === 'signed' && <Tag tone="aligned">SIGNED OFF</Tag>}
              </div>
              <StatBar label="FREQUENCY" value={s.freq} unit="/min" fill={s.state === 'reviewing' ? 'red' : 'white'} height={38} valueWidth={92} skew="var(--clip-statbar-skew-compact)" />
              <StatBar label="ABSENCE" value={s.gaps} unit="gaps" height={38} valueWidth={92} skew="var(--clip-statbar-skew-compact)" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['PA', 'PB', 'PC', 'PD', 'PE'].map((p, i) => (
                    <HexSlot key={p} initials={p} width={26} height={30} state={i === 0 ? 'active' : i === 4 ? 'offline' : 'idle'} />
                  ))}
                </div>
                <Button variant="secondary" style={{ padding: '9px 14px' }} onClick={() => onOpen && onOpen(s)}>Open</Button>
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
