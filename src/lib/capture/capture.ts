/** The app's third seam (spec #40). `getUserMedia`, `getDisplayMedia`,
 *  `MediaRecorder`, IndexedDB and the level meter's analyser are all unreachable
 *  from the HTTP boundary every other test mocks at, and none of them exists
 *  usefully in jsdom. What the app needs of them is declared here: a media
 *  adapter supplies it in production, a double in tests. */

export type CaptureSource = 'microphone' | 'display';

/** Why no stream came back. `blocked` is a refusal the browser has remembered,
 *  which a retry can never clear — only its own permission control can. */
export type CaptureRefusal = 'refused' | 'blocked' | 'unavailable';

export type CaptureStart =
  | { granted: true; run: CaptureRun }
  | { granted: false; source: CaptureSource; refusal: CaptureRefusal };

export interface CaptureReading {
  /** 0–1, the microphone's own input level. Device feedback, not a measurement:
   *  nothing on this Screen analyses anything (spec #40). */
  level: number;
  /** Each track as the browser last reported it. Revoking a permission mid-run
   *  ends one, which is what makes a dead microphone visible. */
  microphone: boolean;
  display: boolean;
}

/** Both files a run produces, plus the zero the upload carries. Either may be
 *  null: a player whose screen capture failed can still deliver their mic. */
export interface CaptureTake {
  audio: Blob | null;
  video: Blob | null;
  startedAt: string;
}

/** One player's live capture, held for as long as their Screen is mounted. */
export interface CaptureRun {
  /** This browser's recorder zero, ISO. The elapsed clock counts from here, and
   *  the upload sends it as `audio_client_started_at` / `video_client_started_at`. */
  readonly startedAt: string;
  /** What the browser says it is capturing, per source, ready to draw. */
  readonly devices: Record<CaptureSource, string>;
  /** The player's own preview elements attach to these. Null under a double. */
  readonly preview: Record<CaptureSource, MediaStream | null>;
  /** The same object until a value changes — `useSyncExternalStore` requires a
   *  stable snapshot, and this one moves at the frame rate. */
  reading(): CaptureReading;
  watch(listener: () => void): () => void;
  /** Stop both recorders, repair each container's duration, and yield the files.
   *  Idempotent: a second call answers with the take the first one produced. */
  finish(): Promise<CaptureTake>;
  /** Forget what storage holds for this run, once its take has been delivered.
   *  A run that never reaches here is what `recoverable()` finds after a reload. */
  delivered(): Promise<void>;
  /** Stop the recorders and release both streams, which is what turns off the
   *  browser's own recording indicator. Storage is left alone. */
  release(): void;
}

/** A recording a previous run in this browser left behind. It can never reach
 *  its Session — the endpoint stores one file per participant and replaces on
 *  re-upload — so the only thing to do with it is hand it to its owner. */
export interface CaptureOrphan {
  sessionId: number;
  startedAt: string;
  bytes: number;
  /** Hand it over as files and forget it. Deleting it silently is the outcome
   *  ADR 0006 exists to prevent. */
  save(): Promise<void>;
}

export interface Capture {
  /** Ask for a window and a microphone. Must be called from a click: the window
   *  picker needs a transient user activation, and it is asked for first because
   *  a permission prompt outlives that activation. */
  start(sessionId: number): Promise<CaptureStart>;
  /** Unfinished recordings this browser still holds, newest first. Read before
   *  starting a run — a fresh run never collides with one, but a Screen that
   *  asked afterwards would be offering the take it had just begun. */
  recoverable(): Promise<CaptureOrphan[]>;
}
