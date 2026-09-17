import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button/button';
import { Surface } from '@/components/ui/surface/surface';
import { LevelMeter } from '@/features/sessions/components/level-meter';
import { SourceCaption } from '@/features/sessions/components/source-caption';
import { formatElapsed } from '@/features/sessions/recording';
import { useElapsed } from '@/features/sessions/hooks/use-elapsed';
import { useCaptureReading } from '@/lib/capture/hooks';
import type { CaptureRefusal, CaptureRun, CaptureSource } from '@/lib/capture/capture';
import type { CaptureState } from '@/features/sessions/hooks/use-capture-run';
import styles from './capture-panel.module.css';

const SOURCE_NAMES: Record<CaptureSource, string> = {
  microphone: 'microphone',
  display: 'game window',
};

/** The picker is shown by the browser every session and cannot be pre-selected
 *  or skipped, so the copy says so rather than implying a setting exists. */
const BEFORE =
  'Your microphone and your game window are both recorded. Your browser asks you to pick the window itself, every session, and no setting can remember the choice.';

/** Game audio is a Windows-only capability. The microphone is not, and the copy
 *  must not imply the microphone is the only thing being captured (spec #40). */
const PLATFORM = 'GAME AUDIO IS CAPTURED ON WINDOWS ONLY — YOUR MICROPHONE IS CAPTURED EVERYWHERE';

/** A refusal the browser has remembered cannot be cleared by a control of ours,
 *  so the copy points at the one that can. */
const BLOCKED =
  'Your browser has remembered that refusal, so trying again here cannot work. Open the permission control beside the address bar, allow it, then try again.';

const UNAVAILABLE = 'This browser did not offer it. Nothing is being recorded for you.';

/** The player's own panel: what is being captured, the device behind it, and a
 *  meter that moves with their voice. All `getUserMedia` facts about this
 *  browser, which is why the Coach's table cannot carry them (spec #40). */
export function CapturePanel({ state, onBegin }: { state: CaptureState; onBegin: () => void }) {
  if (state.phase === 'capturing') {
    return (
      <Surface
        as="section"
        level={2}
        behind="var(--void)"
        padding="var(--space-6)"
        aria-label="Your capture"
        className={styles.panel}
      >
        <Capturing run={state.run} onBegin={onBegin} />
      </Surface>
    );
  }

  return (
    <Surface
      as="section"
      level={2}
      behind="var(--void)"
      padding="var(--space-6)"
      aria-label="Your capture"
      className={styles.panel}
    >
      <Waiting state={state} onBegin={onBegin} />
    </Surface>
  );
}

function Waiting({ state, onBegin }: { state: CaptureState; onBegin: () => void }) {
  const refused = state.phase === 'refused' ? state : null;

  return (
    <div className={styles.waiting}>
      <span className={styles.status} data-tone="idle">
        <span className={styles.dot} aria-hidden="true" />
        NOT CAPTURING
      </span>

      <p className={styles.lede}>{refused ? refusalCopy(refused) : BEFORE}</p>

      {refused?.refusal === 'blocked' ? <p className={styles.instruction}>{BLOCKED}</p> : null}

      <Button disabled={state.phase === 'asking'} onClick={onBegin}>
        {refused ? 'Try again' : 'Start capturing'}
      </Button>

      <span className={styles.micro}>{PLATFORM}</span>
    </div>
  );
}

/** A refusal is a fact about what is being recorded, not a failure of the
 *  player's, so the Screen states it rather than blaming them. */
function refusalCopy({ source, refusal }: { source: CaptureSource; refusal: CaptureRefusal }) {
  if (refusal === 'unavailable') return `Your ${SOURCE_NAMES[source]} was not available. ${UNAVAILABLE}`;
  return `Your ${SOURCE_NAMES[source]} was not granted. Nothing is being recorded for you.`;
}

function Capturing({ run, onBegin }: { run: CaptureRun; onBegin: () => void }) {
  const reading = useCaptureReading(run);
  const elapsed = useElapsed(run.startedAt);
  const stopped = !reading.microphone || !reading.display;

  return (
    <div className={styles.live}>
      <div className={styles.head}>
        <div className={styles.clock}>
          <span className={styles.status} data-tone="recording">
            <span className={styles.dot} aria-hidden="true" />
            RECORDING
          </span>

          <figure className={styles.elapsed} aria-label="Elapsed recording time">
            <span className={styles.elapsedValue}>{formatElapsed(elapsed)}</span>
            {/* The design labels this ELAPSED ON SESSION CLOCK. It is not a
                session clock: it counts this browser's own recorder (spec #40). */}
            <figcaption className={styles.elapsedLabel}>ELAPSED ON YOUR RECORDING</figcaption>
          </figure>
        </div>
      </div>

      <div className={styles.sources}>
        <div className={styles.source}>
          <div className={styles.sourceHead}>
            <span className={styles.sourceLabel}>MIC</span>
            <span className={styles.device}>{run.devices.microphone}</span>
          </div>

          <LevelMeter run={run} />
        </div>

        <div className={styles.source}>
          <div className={styles.sourceHead}>
            <span className={styles.sourceLabel}>GAME WINDOW</span>
            <span className={styles.device}>{run.devices.display}</span>
          </div>

          <Preview stream={run.preview.display} />

          <SourceCaption live={reading.display}>
            {reading.display ? 'CAPTURING THIS WINDOW' : 'WINDOW SHARING ENDED'}
          </SourceCaption>
        </div>
      </div>

      {stopped ? <Stopped reading={reading} onBegin={onBegin} /> : null}
    </div>
  );
}

/** A permission revoked mid-run. The Coach's table still reads CAPTURING until
 *  this player acts: the only endpoint that would move it discards their take
 *  (backend ADR 0013). `Joe-Zupo/aod-backend#25` is the wider gap behind it. */
function Stopped({
  reading,
  onBegin,
}: {
  reading: { microphone: boolean; display: boolean };
  onBegin: () => void;
}) {
  const source = !reading.microphone ? 'microphone' : 'game window';

  return (
    <div className={styles.stopped}>
      <p className={styles.alert} role="alert">
        Your {source} stopped, so nothing is being captured for it. Starting again begins a
        fresh recording; what this one captured stays in this browser and is offered back below.
      </p>
      <Button onClick={onBegin}>Start capturing again</Button>
    </div>
  );
}

/** So a player can see they shared the game and not their inbox. Muted and
 *  inline: it is their own screen coming back at them, and sound would loop. */
function Preview({ stream }: { stream: MediaStream | null }) {
  const element = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = element.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <Surface level={0} behind="var(--e2-surface)" padding="0" className={styles.previewPlate}>
      <div className={styles.preview}>
        <video ref={element} className={styles.video} muted autoPlay playsInline aria-label="Shared window" />
      </div>
    </Surface>
  );
}
