import { act } from '@testing-library/react';
import type {
  Capture,
  CaptureOrphan,
  CaptureReading,
  CaptureRun,
  CaptureSource,
  CaptureRefusal,
  CaptureStart,
} from '@/lib/capture/capture';

/** The test side of the capture port. An input, not a place to assert behaviour
 *  — except for the bookkeeping that is invisible by construction: that leaving
 *  the Screen released the streams renders exactly as a run that is still going. */
export interface CaptureDouble extends Capture {
  /** Refuse the next ask for this source, as a click on Block does. */
  refuse(source: CaptureSource, refusal?: CaptureRefusal): void;
  /** Grant it again, for the retry a player is offered. */
  allow(source: CaptureSource): void;
  /** Move the device level the meter draws. */
  setLevel(level: number): void;
  /** End a track, as revoking a permission mid-run does. */
  endTrack(source: CaptureSource): void;
  /** Where the recorder's zero sits. Set in the past to mount mid-run. */
  setStartedAt(iso: string): void;
  /** What a previous run in this browser left behind. */
  seedOrphan(orphan: { sessionId: number; startedAt: string; bytes: number }): void;
  /** Session ids, in call order. */
  readonly started: number[];
  readonly finished: number[];
  readonly delivered: number[];
  readonly released: number[];
  readonly saved: number[];
}

const DEVICES: Record<CaptureSource, string> = {
  microphone: 'SHURE MV7 — 48 kHz',
  display: 'VALORANT — 1080p30',
};

/** Non-empty so a test can assert on what was sent rather than on an empty part. */
const file = (type: string) => new Blob(['recorded'], { type });

export function createCaptureDouble(): CaptureDouble {
  const refusals = new Map<CaptureSource, CaptureRefusal>();
  const orphans: Array<{ sessionId: number; startedAt: string; bytes: number }> = [];
  const started: number[] = [];
  const finished: number[] = [];
  const delivered: number[] = [];
  const released: number[] = [];
  const saved: number[] = [];

  let startedAt = new Date().toISOString();
  let live: { run: CaptureRun; announce(next: Partial<CaptureReading>): void } | null = null;

  function openRun(sessionId: number) {
    const watchers = new Set<() => void>();
    const runStartedAt = startedAt;
    let reading: CaptureReading = { level: 0, microphone: true, display: true };
    let handedOver = false;

    function announce(next: Partial<CaptureReading>): void {
      reading = { ...reading, ...next };
      for (const watcher of watchers) watcher();
    }

    const run: CaptureRun = {
      startedAt,
      devices: DEVICES,
      // jsdom has no media, and no rendered assertion depends on one.
      preview: { microphone: null, display: null },
      reading: () => reading,
      watch(listener) {
        watchers.add(listener);
        return () => watchers.delete(listener);
      },
      async finish() {
        finished.push(sessionId);
        return {
          audio: reading.microphone ? file('audio/webm') : null,
          video: reading.display ? file('video/webm') : null,
          startedAt,
        };
      },
      async delivered() {
        handedOver = true;
        delivered.push(sessionId);
      },
      release() {
        released.push(sessionId);
        // Storage outlives a release and is cleared only by delivery, so a run
        // that ends any other way becomes recoverable (ADR 0012).
        if (!handedOver) orphans.push({ sessionId, startedAt: runStartedAt, bytes: 4_000_000 });
        if (live?.run === run) live = null;
      },
    };

    return { run, announce };
  }

  return {
    async start(sessionId): Promise<CaptureStart> {
      started.push(sessionId);

      for (const source of ['display', 'microphone'] as const) {
        const refusal = refusals.get(source);
        if (refusal) return { granted: false, source, refusal };
      }

      live = openRun(sessionId);
      return { granted: true, run: live.run };
    },

    async recoverable(): Promise<CaptureOrphan[]> {
      return orphans.map((orphan) => ({
        ...orphan,
        async save() {
          saved.push(orphan.sessionId);
          // Handed over is gone: the adapter drops the run once it has been
          // saved, so a double that kept it would model a browser that lies.
          orphans.splice(orphans.indexOf(orphan), 1);
        },
      }));
    },

    refuse: (source, refusal = 'refused') => refusals.set(source, refusal),
    allow: (source) => refusals.delete(source),
    setStartedAt: (iso) => {
      startedAt = iso;
    },
    seedOrphan: (orphan) => orphans.push(orphan),

    // Wrapped here rather than at every call site: a device moving is a render
    // the test did not start.
    setLevel: (level) => act(() => live?.announce({ level })),
    endTrack: (source) =>
      act(() => live?.announce(source === 'microphone' ? { microphone: false, level: 0 } : { display: false })),

    started,
    finished,
    delivered,
    released,
    saved,
  };
}
