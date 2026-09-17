import {
  appendChunk,
  beginRun,
  dropRun,
  listRuns,
  readChunks,
  runBytes,
} from '@/lib/capture/chunk-store';
import type { ChunkKind } from '@/lib/capture/chunk-store';
import { withDuration } from '@/lib/capture/webm-duration';
import type {
  Capture,
  CaptureOrphan,
  CaptureReading,
  CaptureRun,
  CaptureSource,
  CaptureStart,
  CaptureTake,
} from '@/lib/capture/capture';

/** The production side of the capture port: `getDisplayMedia`, `getUserMedia`,
 *  two `MediaRecorder`s, the chunk store and the level meter's analyser, behind
 *  the interface `capture.ts` declares. */

/** Chosen rather than inherited (spec #40). A forty-minute match is then roughly
 *  450 MB of video against the endpoint's 2 GB ceiling and 19 MB of audio
 *  against its 200 MB. 30fps is what makes 1.5 Mbps watchable at 1080p. */
const VIDEO_BITS_PER_SECOND = 1_500_000;
const AUDIO_BITS_PER_SECOND = 64_000;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const MAX_FRAME_RATE = 30;

/** ADR 0006's timeslice: the worst case a crash costs. */
const TIMESLICE_MS = 5_000;

/** The meter is device feedback, so it is redrawn often enough to look live and
 *  no more — a render per animation frame would cost a frame per bar. */
const LEVEL_INTERVAL_MS = 66;

const AUDIO_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
const VIDEO_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

const supported = (types: string[]) =>
  types.find((type) => MediaRecorder.isTypeSupported(type)) ?? types[types.length - 1];

/** `NotAllowedError` covers both a click on Block and a refusal the browser has
 *  remembered; only the Permissions API separates them, and it does not describe
 *  screen capture at all. A prompt the user dismissed leaves the state `prompt`. */
async function refusalFor(source: CaptureSource, cause: unknown): Promise<CaptureStart> {
  const name = cause instanceof DOMException ? cause.name : '';
  if (name !== 'NotAllowedError' && name !== 'SecurityError') {
    return { granted: false, source, refusal: 'unavailable' };
  }

  if (source === 'microphone') {
    try {
      const state = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (state.state === 'denied') return { granted: false, source, refusal: 'blocked' };
    } catch {
      // Firefox does not describe `microphone`. A retry is still worth offering.
    }
  }

  return { granted: false, source, refusal: 'refused' };
}

/** What the browser says it is capturing: the device's own label, plus the one
 *  setting that tells a player whether they picked the right thing. */
function describe(track: MediaStreamTrack, source: CaptureSource): string {
  const settings = track.getSettings();
  const label = track.label || (source === 'microphone' ? 'DEFAULT MICROPHONE' : 'SHARED WINDOW');

  if (source === 'microphone') {
    const rate = settings.sampleRate ? ` — ${Math.round(settings.sampleRate / 1000)} kHz` : '';
    return `${label.toUpperCase()}${rate}`;
  }

  const size = settings.height ? ` — ${settings.height}p${Math.round(settings.frameRate ?? 0)}` : '';
  return `${label.toUpperCase()}${size}`;
}

/** RMS over the time domain, which moves with a voice the way a meter should.
 *  Frequency data peaks on any noise floor and reads as signal when there is none. */
function createLevelMeter(stream: MediaStream, onLevel: (level: number) => void) {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  context.createMediaStreamSource(stream).connect(analyser);

  const samples = new Uint8Array(analyser.fftSize);
  const timer = setInterval(() => {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) {
      const centred = (sample - 128) / 128;
      sum += centred * centred;
    }
    // Scaled so ordinary speech fills most of the meter; a dead microphone is
    // the reading that has to be unmistakable.
    onLevel(Math.min(1, Math.sqrt(sum / samples.length) * 4));
  }, LEVEL_INTERVAL_MS);

  return () => {
    clearInterval(timer);
    void context.close();
  };
}

interface Leg {
  recorder: MediaRecorder;
  stop(): Promise<Blob | null>;
}

/** One `MediaRecorder` writing to the chunk store as it goes. */
function startLeg(runId: string, kind: ChunkKind, stream: MediaStream, mimeType: string): Leg {
  const recorder = new MediaRecorder(stream, {
    mimeType,
    ...(kind === 'audio'
      ? { audioBitsPerSecond: AUDIO_BITS_PER_SECOND }
      : { videoBitsPerSecond: VIDEO_BITS_PER_SECOND, audioBitsPerSecond: AUDIO_BITS_PER_SECOND }),
  });

  let seq = 0;
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) void appendChunk(runId, kind, seq++, event.data);
  };
  recorder.start(TIMESLICE_MS);

  return {
    recorder,
    stop() {
      if (recorder.state === 'inactive') return assemble(runId, kind, mimeType);
      return new Promise((resolve) => {
        recorder.onstop = () => resolve(assemble(runId, kind, mimeType));
        recorder.stop();
      });
    },
  };
}

async function assemble(runId: string, kind: ChunkKind, mimeType: string): Promise<Blob | null> {
  const chunks = await readChunks(runId, kind);
  if (chunks.length === 0) return null;
  return new Blob(chunks, { type: mimeType });
}

export function createMediaCapture(): Capture {
  // The run this browser is recording right now, which is never recoverable:
  // offering it back would hand the player the take they are still making.
  let active: string | null = null;

  return {
    async start(sessionId: number): Promise<CaptureStart> {
      let display: MediaStream;
      try {
        // First, and synchronously in the click: the picker spends the transient
        // user activation, and a microphone prompt would outlive it.
        display = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { max: MAX_WIDTH },
            height: { max: MAX_HEIGHT },
            frameRate: { max: MAX_FRAME_RATE },
          },
          // Windows supplies game audio here; macOS never does. It rides with the
          // VOD and never with the AOD, which transcription runs on.
          audio: true,
        });
      } catch (cause) {
        return refusalFor('display', cause);
      }

      let microphone: MediaStream;
      try {
        microphone = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
        });
      } catch (cause) {
        for (const track of display.getTracks()) track.stop();
        return refusalFor('microphone', cause);
      }

      const run = openRun(sessionId, microphone, display);
      active = run.id;
      return { granted: true, run };
    },

    async recoverable(): Promise<CaptureOrphan[]> {
      const runs = (await listRuns()).filter((run) => run.id !== active);

      return Promise.all(
        runs.map(async (run) => ({
          sessionId: run.sessionId,
          startedAt: run.startedAt,
          bytes: await runBytes(run.id),
          async save() {
            const [audio, video] = await Promise.all([
              assemble(run.id, 'audio', run.audioType),
              assemble(run.id, 'video', run.videoType),
            ]);
            const stamp = run.startedAt.replace(/[:.]/g, '-');
            if (audio) offer(audio, `session-${run.sessionId}-audio-${stamp}.webm`);
            if (video) offer(video, `session-${run.sessionId}-video-${stamp}.webm`);
            await dropRun(run.id);
          },
        })),
      );
    },
  };
}

/** The browser's own save dialog. The only way a recovered take leaves here. */
function offer(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

/** The run, plus the id the port needs to keep it out of `recoverable()`. */
function openRun(
  sessionId: number,
  microphone: MediaStream,
  display: MediaStream,
): CaptureRun & { id: string } {
  const runId = `${sessionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();
  const audioType = supported(AUDIO_TYPES);
  const videoType = supported(VIDEO_TYPES);

  void beginRun({ id: runId, sessionId, startedAt, audioType, videoType });

  const watchers = new Set<() => void>();
  let reading: CaptureReading = { level: 0, microphone: true, display: true };

  function announce(next: Partial<CaptureReading>): void {
    const merged = { ...reading, ...next };
    if (
      merged.level === reading.level &&
      merged.microphone === reading.microphone &&
      merged.display === reading.display
    ) {
      return;
    }
    reading = merged;
    for (const watcher of watchers) watcher();
  }

  const micTrack = microphone.getAudioTracks()[0];
  const displayTrack = display.getVideoTracks()[0];
  micTrack.addEventListener('ended', () => announce({ microphone: false, level: 0 }));
  displayTrack.addEventListener('ended', () => announce({ display: false }));

  const stopMeter = createLevelMeter(microphone, (level) => announce({ level }));

  const audio = startLeg(runId, 'audio', microphone, audioType);
  const video = startLeg(runId, 'video', display, videoType);

  let take: Promise<CaptureTake> | null = null;

  function releaseStreams(): void {
    stopMeter();
    for (const track of [...microphone.getTracks(), ...display.getTracks()]) track.stop();
  }

  return {
    id: runId,
    startedAt,
    devices: { microphone: describe(micTrack, 'microphone'), display: describe(displayTrack, 'display') },
    preview: { microphone, display },
    reading: () => reading,

    watch(listener) {
      watchers.add(listener);
      return () => watchers.delete(listener);
    },

    finish() {
      take ??= (async () => {
        const [rawAudio, rawVideo] = await Promise.all([audio.stop(), video.stop()]);
        const elapsed = Date.now() - Date.parse(startedAt);
        releaseStreams();

        const [repairedAudio, repairedVideo] = await Promise.all([
          rawAudio ? withDuration(rawAudio, elapsed) : null,
          rawVideo ? withDuration(rawVideo, elapsed) : null,
        ]);

        return { audio: repairedAudio, video: repairedVideo, startedAt };
      })();

      return take;
    },

    delivered: () => dropRun(runId),

    release() {
      if (audio.recorder.state !== 'inactive') audio.recorder.stop();
      if (video.recorder.state !== 'inactive') video.recorder.stop();
      releaseStreams();
    },
  };
}
