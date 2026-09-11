import React from 'react';
import { Surface } from '../../components/core/Surface.jsx';
import { Button } from '../../components/core/Button.jsx';
import { IconButton } from '../../components/core/IconButton.jsx';
import { Tag } from '../../components/core/Tag.jsx';
import { Input } from '../../components/core/Input.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { NotchedCard } from '../../components/core/NotchedCard.jsx';
import { StatBar } from '../../components/data/StatBar.jsx';
import { HexSlot } from '../../components/data/HexSlot.jsx';
import { TimelineTrack } from '../../components/data/TimelineTrack.jsx';
import { AnnotationCard } from '../../components/data/AnnotationCard.jsx';
import { NavItem } from '../../components/navigation/NavItem.jsx';
import { PlateFrame } from '../../components/navigation/PlateFrame.jsx';

const TRACKS = [
  { label: 'EVENTS', markers: [{ at: '14%', type: 'event' }, { at: '38%', type: 'event' }, { at: '62%', type: 'event' }, { at: '91%', type: 'event' }] },
  { label: 'PA_WALKER', markers: [{ at: '9%', type: 'informative' }, { at: '22%', type: 'declarative' }, { at: '74%', type: 'informative' }, { at: '88%', type: 'declarative' }], selectedAt: { at: '41%', type: 'compound' } },
  { label: 'PB_REYES', markers: [{ at: '12%', type: 'declarative' }, { at: '31%', type: 'informative' }, { at: '86%', type: 'informative' }], absence: { from: '56%', width: '11%' } },
  { label: 'PC_CARETO', markers: [{ at: '6%', type: 'informative' }, { at: '36%', type: 'compound' }, { at: '55%', type: 'declarative' }, { at: '81%', type: 'informative' }] },
  { label: 'PD_MOORE', markers: [{ at: '19%', type: 'informative' }, { at: '48%', type: 'informative' }, { at: '69%', type: 'declarative' }] }
];

export function ReviewBoard({ sessionId = 'SESSION_047', onBack }) {
  const [playing, setPlaying] = React.useState(true);
  const [nudge, setNudge] = React.useState(0.32);

  return (
    <div style={{ padding: '26px 32px 40px', position: 'relative' }} data-screen-label="Review Board">
      <div style={{ position: 'absolute', top: 6, right: 96, zIndex: 3 }}>
        <Surface level={3} grooves={0} padding="7px 12px" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, background: 'var(--cyan)', borderRadius: 'var(--radius-pill)', animation: 'aod-pulse 1.8s ease-in-out infinite', display: 'block' }} />
          <span style={{ font: 'var(--type-micro)', letterSpacing: '.1em', color: 'var(--cyan)' }}>2 REVIEWING</span>
          <span style={{ display: 'flex', gap: 4 }}>
            <HexSlot initials="EW" width={20} height={22} state="active" />
            <HexSlot initials="SR" width={20} height={22} />
          </span>
        </Surface>
      </div>

      <div style={{ background: 'var(--ash)', border: 'var(--border-width) solid var(--border-raised)', boxShadow: 'var(--bezel-shadow)', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--size-sidebar) minmax(520px,1fr) var(--size-rail)', minHeight: 660, minWidth: 1060 }}>

          <PlateFrame padding="22px 0 18px" style={{ borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'var(--border-width) solid var(--border-soft)' }}>
            <div style={{ padding: '0 18px 20px', borderBottom: 'var(--border-width) solid var(--border-soft)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <Icon name="role" size={18} color="var(--red)" />
                <span style={{ font: 'var(--type-display-s)', fontSize: 22, textTransform: 'uppercase' }}>AOD Comms</span>
              </div>
              <div style={{ background: 'var(--e0-surface)', border: 'var(--border-width) solid var(--e0-border)', boxShadow: 'var(--e0-shadow)', padding: '9px 11px', cursor: 'pointer' }}>
                <div style={{ font: 'var(--type-micro)', fontSize: 9.5, color: 'var(--text-muted)' }}>WORKSPACE</div>
                <div style={{ font: 'var(--type-label)', fontSize: 12.5 }}>Sentinel Academy</div>
              </div>
            </div>
            <NavItem label="Dashboard" icon={<Icon name="tracks" size={16} />} onClick={onBack} />
            <NavItem label="Sessions" active icon={<Icon name="aperture" size={16} color="var(--red)" />} />
            <NavItem label="Team" icon={<Icon name="role" size={16} />} />
            <NavItem label="Settings" icon={<Icon name="lens" size={16} />} />
            <div style={{ margin: '22px 18px 0', paddingTop: 16, borderTop: 'var(--border-width) solid var(--border-soft)', font: 'var(--type-micro)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 2 }}>
              <div>BUILD:4.0.2</div>
              <div>RIOT_API<span style={{ color: 'var(--aligned)' }}>:OK</span></div>
            </div>
          </PlateFrame>

          <div style={{ background: 'var(--void)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: 'var(--border-width) solid var(--border-soft)', background: 'var(--ash)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ font: 'var(--type-display-s)', textTransform: 'uppercase' }}>Ascent // Round 14</span>
                <Tag>{sessionId}</Tag>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {['PA', 'PB', 'PC', 'PD', 'PE'].map((p, i) => (
                  <HexSlot key={p} initials={p} width={34} height={38} state={i === 0 ? 'active' : i === 4 ? 'offline' : 'idle'} />
                ))}
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ position: 'relative', background: 'var(--void)', border: 'var(--border-width) solid var(--border-soft)', boxShadow: 'var(--e0-shadow)', aspectRatio: '16/9', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg,var(--plate-grid) 0 1px,transparent 1px 44px),repeating-linear-gradient(0deg,var(--plate-grid) 0 1px,transparent 1px 44px)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: 'var(--type-display-xl)', fontSize: 120, color: 'rgba(255,255,255,.035)', textTransform: 'uppercase' }}>VOD_PA</div>
                <div style={{ position: 'absolute', top: 16, left: 18, display: 'flex', alignItems: 'center', gap: 8, font: 'var(--type-micro)', letterSpacing: '.1em', color: 'var(--cyan)' }}>
                  <Icon name="sync" size={12} color="var(--cyan)" />
                  <span>SYNCED TO RIOT CLOCK</span>
                </div>
                <div style={{ position: 'absolute', top: '38%', left: '31%', display: 'flex', alignItems: 'center', gap: 7, background: 'var(--steel-2)', border: 'var(--border-width) solid var(--compound)', boxShadow: '0 6px 18px rgba(0,0,0,.55)', padding: '6px 10px' }}>
                  <span style={{ width: 8, height: 8, background: 'var(--compound)', transform: 'rotate(45deg)', display: 'block' }} />
                  <span style={{ font: 'var(--type-micro)', fontSize: 10.5, letterSpacing: '.06em', color: 'var(--text-primary)' }}>"THEY'RE ROTATING B — TAKE MID NOW"</span>
                </div>
                <div style={{ position: 'absolute', top: 'calc(38% + 26px)', left: 'calc(31% + 12px)', width: 1, height: 54, background: 'linear-gradient(var(--compound),rgba(255,111,168,0))' }} />
                <div style={{ position: 'absolute', top: 'calc(38% + 78px)', left: 'calc(31% + 6px)', width: 13, height: 13, border: 'var(--border-width) solid var(--compound)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '16%', right: '22%', display: 'flex', alignItems: 'center', gap: 7, background: 'var(--steel)', border: 'var(--border-width) solid var(--border-raised)', padding: '5px 9px' }}>
                  <span style={{ width: 7, height: 7, background: 'var(--declarative)', transform: 'rotate(45deg)', display: 'block' }} />
                  <span style={{ font: 'var(--type-micro)', fontSize: 10, color: 'var(--text-secondary)' }}>SPIKE PLANT 00:14:19</span>
                </div>
                <div style={{ position: 'absolute', bottom: 14, left: 18, font: 'var(--type-data)', color: 'var(--text-secondary)' }}>
                  00:14:22.480 <span style={{ color: 'var(--text-muted)' }}>/ 00:41:06.000</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <span style={{ font: 'var(--type-micro)', letterSpacing: 'var(--track-micro)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Game start anchor</span>
                <Button variant="secondary" style={{ padding: '7px 12px', clipPath: 'none' }} onClick={() => setNudge(n => +(n - 1).toFixed(2))}>−1s</Button>
                <div style={{ font: 'var(--type-data)', color: 'var(--text-primary)', background: 'var(--e0-surface)', border: 'var(--border-width) solid var(--e0-border)', boxShadow: 'var(--e0-shadow)', padding: '7px 14px' }}>
                  {nudge > 0 ? '+' : ''}{nudge.toFixed(3)}s
                </div>
                <Button variant="secondary" style={{ padding: '7px 12px', clipPath: 'none' }} onClick={() => setNudge(n => +(n + 1).toFixed(2))}>+1s</Button>
                <Button variant="live" icon={<Icon name="sync" size={12} color="var(--cyan)" />} onClick={() => setNudge(0.32)}>Reset to Riot sync</Button>
                <Button style={{ marginLeft: 'auto' }} onClick={() => setPlaying(p => !p)}>{playing ? '❚❚ Pause' : '▶ Play'}</Button>
              </div>
            </div>

            <div style={{ margin: '0 20px 20px', background: 'var(--e0-surface)', border: 'var(--border-width) solid var(--e0-border)', boxShadow: 'var(--e0-shadow)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ font: 'var(--type-micro)', letterSpacing: 'var(--track-micro)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Canonical timeline</span>
                <span style={{ font: 'var(--type-micro)', fontSize: 10, color: 'var(--text-muted)' }}>TIMELINE_ID:0043-A</span>
              </div>
              <div style={{ position: 'relative' }}>
                {TRACKS.map(t => <TimelineTrack key={t.label} {...t} />)}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'var(--size-track-label)', right: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '41%', width: 1, background: 'var(--text-primary)', boxShadow: '0 0 8px rgba(255,255,255,.5)', opacity: playing ? 1 : 0.45 }}>
                    <span style={{ position: 'absolute', top: -4, left: -3, width: 7, height: 7, background: 'var(--text-primary)', transform: 'rotate(45deg)', display: 'block' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', marginTop: 8 }}>
                <div style={{ width: 'var(--size-track-label)', flex: 'none' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', font: 'var(--type-micro)', fontSize: 9.5, color: 'var(--text-muted)' }}>
                  {['13:40', '14:00', '14:20', '14:40', '15:00'].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          </div>

          <PlateFrame corner="top-right" padding="18px" style={{ borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'var(--border-width) solid var(--border-soft)' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-micro)', letterSpacing: '.12em', color: 'var(--text-muted)', marginBottom: 7 }}>
                <span>REVIEW PROGRESS</span><span style={{ color: 'var(--text-primary)' }}>62%</span>
              </div>
              <div style={{ height: 5, background: 'var(--e0-surface)', border: 'var(--border-width) solid var(--e0-border)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.85)' }}>
                <div style={{ width: '62%', height: '100%', background: 'var(--red)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              <StatBar label="FREQUENCY" value="18.4" fill="red" height={40} valueWidth={96} skew="var(--clip-statbar-skew-compact)" />
              <StatBar label="ABSENCE" value="6" height={40} valueWidth={96} skew="var(--clip-statbar-skew-compact)" />
              <StatBar label="ALIGNMENT" value="87" unit="%" fill="aligned" height={40} valueWidth={96} skew="var(--clip-statbar-skew-compact)" />
            </div>

            <NotchedCard
              badge={<span style={{ width: 9, height: 9, background: 'var(--compound)', transform: 'rotate(45deg)', display: 'block' }} />}
              badgeSize={26}
              padding="44px 16px 16px"
              style={{ marginBottom: 18 }}
            >
              <div style={{ font: 'var(--type-micro)', fontSize: 10, letterSpacing: '.12em', color: 'var(--compound)', marginBottom: 6 }}>SELECTED MOMENT // COMPOUND</div>
              <div style={{ font: 'var(--type-display-m)', fontSize: 28, textTransform: 'uppercase', marginBottom: 8 }}>Mid take call</div>
              <div style={{ font: 'var(--type-data)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                <div>t <span style={{ color: 'var(--text-primary)' }}>00:14:22.480</span></div>
                <div>speaker <span style={{ color: 'var(--text-primary)' }}>PA_WALKER</span></div>
                <div>alignment <span style={{ color: 'var(--declarative)' }}>DELAYED 3.1s</span></div>
              </div>
            </NotchedCard>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ font: 'var(--type-micro)', letterSpacing: '.12em', color: 'var(--text-muted)' }}>ANNOTATIONS · 3</span>
                <IconButton label="Add annotation" size={26}><Icon name="add" size={12} /></IconButton>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnnotationCard author="Coach Vela" timestamp="14:22" body="Call lands after the rotate is already committed. Needs to come at first contact, not after." />
                <AnnotationCard author="Reyes" timestamp="14:26" body="I held mid waiting on confirm — 6.4s of nothing on comms there." />
              </div>
              <div style={{ marginTop: 14 }}>
                <Input label="Add a note" placeholder="Type at 14:22…" />
              </div>
            </div>
          </PlateFrame>

        </div>
      </div>
    </div>
  );
}
