import { api } from '@/lib/api-client';
import type { CaptureTake } from '@/lib/capture/capture';
import type { RecordingMeta } from '@/types/api';

/** One player's own delivery. Not part of the capture port: it is HTTP, so it is
 *  mocked where everything else is, and `api-client` already carries
 *  `onUploadProgress` (spec #40). */

export interface DeliveryResult {
  aod: RecordingMeta | null;
  vod: RecordingMeta | null;
}

/** Three attempts, then stop and say so. The base is short because a player is
 *  watching this number move; retrying forever hides a dead connection behind a
 *  spinner, and a long backoff hides it behind a stalled one. */
const ATTEMPTS = 3;
const BACKOFF_MS = 300;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function bodyFor(take: CaptureTake): FormData {
  const body = new FormData();

  // The AOD is what transcription runs on and the VOD is what the Review Board
  // shows. Either may be absent: a player whose screen capture failed still
  // delivers their mic (ADR 0012).
  if (take.audio) {
    body.append('audio', new File([take.audio], 'aod.webm', { type: take.audio.type }));
    body.append('audio_client_started_at', take.startedAt);
  }
  if (take.video) {
    body.append('video', new File([take.video], 'vod.webm', { type: take.video.type }));
    body.append('video_client_started_at', take.startedAt);
  }

  return body;
}

export async function uploadRecording(
  sessionId: number,
  take: CaptureTake,
  onProgress: (fraction: number) => void,
): Promise<DeliveryResult> {
  const body = bodyFor(take);
  let last: unknown;

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    if (attempt > 0) await wait(BACKOFF_MS * 2 ** (attempt - 1));

    try {
      return await api.post<DeliveryResult>(`/sessions/${sessionId}/recording`, body, {
        onUploadProgress: onProgress,
      });
    } catch (cause) {
      last = cause;
      // A retry restarts the transfer, so the bar has to go back with it.
      onProgress(0);
    }
  }

  throw last;
}
