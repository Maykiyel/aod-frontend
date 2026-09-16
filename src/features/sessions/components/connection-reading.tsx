import { Tag } from '@/components/ui/tag/tag';
import { useLiveStatus } from '@/lib/live-updates/hooks';
import type { ConnectionStatus } from '@/lib/live-updates/live-updates';

const READINGS: Record<ConnectionStatus, { label: string; tone: 'live' | 'neutral' | 'alert' }> = {
  connected: { label: 'LIVE', tone: 'live' },
  connecting: { label: 'CONNECTING', tone: 'neutral' },
  disconnected: { label: 'CONNECTION LOST', tone: 'alert' },
};

/** The live reading beside the panel whose staleness costs something, rather
 *  than only in the shell: a Coach deciding whether to start, or whether anyone
 *  is still capturing, is looking here. */
export function ConnectionReading() {
  const status = useLiveStatus();
  const reading = READINGS[status];

  return (
    <Tag tone={reading.tone} dot={status === 'connected'}>
      {reading.label}
    </Tag>
  );
}
