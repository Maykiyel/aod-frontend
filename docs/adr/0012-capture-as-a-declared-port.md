# 12. Capture is a declared port, and the browser's copy outlives nothing it has delivered

> The third seam, after the HTTP boundary (#14) and live updates (ADR 0011).
> Written during #7. Amends ADR 0006's account of the clock; see ADR 0006's own
> note.

`getUserMedia`, `getDisplayMedia`, `MediaRecorder`, IndexedDB and the level
meter's `AnalyserNode` are all unreachable from the HTTP boundary every test
since #14 mocks at, and none of them exists usefully in jsdom. Without a seam,
the recording Screen is the one Screen in the app no test can drive.

## Decision

### One port, at the app boundary

`src/lib/capture/capture.ts` declares what the app needs: ask for a window and a
microphone, hand back a run that reports its level and the state of each of its
two tracks, stop and yield a finished recording, and list anything a previous run
left behind. A media adapter satisfies it in production; a double drives it in
tests. The port is held on a context beside live updates, so the injection point
is `AppProvider` and nothing else.

Chunking, the analyser, bitrate selection, container repair and the chunk store
all sit inside the adapter. The Screen never learns that chunks exist, only that
stopping yields a finished recording and that orphans can be recovered. That is
what keeps two methods over a lot of machinery.

Upload is deliberately **not** part of it. Delivery is HTTP, so it is mocked
where everything else is, and `api-client` already carries `onUploadProgress`.

### The rule the port exists to enforce

Storage for a run is cleared at exactly one moment: after that run's take has
reached the server. `CaptureRun.delivered()` is the only thing that clears it,
and `release()` on unmount deliberately does not.

Every other ordering loses work. Clearing at `finish()` means a reload during the
upload destroys a take the player was told was safe. Clearing at `release()`
means closing the tab is indistinguishable from delivering. Both are the outcome
ADR 0006 exists to prevent.

The consequence is that an undelivered run survives in the browser until its
owner saves it, which is what `recoverable()` reports and what the Screen offers
back.

### A run is identified by itself, not by its Session

Storage is keyed per run rather than per Session. A reload starts a fresh
recorder for the same Session, and keying on the Session would make the new run
overwrite the orphan the Screen is offering back. It also means `recoverable()`
can be read safely before `start()` and never after.

### The double records its own calls

Two things this port does are invisible in rendered output: that leaving the
Screen released the streams, and that a delivered take cleared the browser's
copy. A recorder that outlives its Screen renders exactly what a correct one
does while holding the microphone. So the double records `release`, `finish` and
`delivered` and those three are asserted at the boundary, the same exception
ADR 0011 made for subscribe and release.

## Considered options

- **Mock the five browser APIs in jsdom.** Rejected. `MediaRecorder` and
  `AudioContext` do not exist there, so the mocks would be the implementation,
  and a test would assert against a recorder nobody wrote.
- **Put upload behind the same port.** Rejected. It is an HTTP call, and moving
  it would take one endpoint out of the seam every other endpoint is tested at
  for no gain.
- **Expose chunks, or the two `MediaRecorder` instances, on the interface.**
  Rejected. The Screen has no decision to make about either, and every fact on an
  interface is a fact its tests have to arrange.

## Consequences

- The Screen can be driven without a microphone, a window or a real recorder, and
  the capture table, the meter, the elapsed clock and the recovery offer are all
  assertable in rendered output.
- The adapter itself is not covered by any test, which is the price of the seam.
  The duration repair in `webm-duration.ts` and the chunk store are the two
  places where that costs most; both are pure enough to be moved behind their own
  tests if a defect ever turns up there.
- A player who never saves a recovered take keeps it in IndexedDB until they do.
  That is deliberate: it is the fallback ADR 0006 describes, and it is
  same-browser-same-device only.
