# Every player records video, because the Review Board switches point of view

The Review Board's video frame is a point-of-view switcher, not a single feed.
Every participant captures their own game window, and the coach switches between
those captures while reviewing. Where a participant's recording is missing or
was cut off, the board shows a black frame with an indicator saying why.

This is worth recording because the obvious reading of the design is the
opposite one. Screen 12 draws a single video frame, and **analysis never touches
video at all** — transcription runs on audio, and communication events, dead air
and alignment are all derived from it. So a future reader finding gigabytes of
per-player video in storage, feeding one frame that shows one player at a time,
will reasonably ask why it is not captured from the coach alone.

## Considered options

Capturing audio from every player and video from the coach only was seriously
considered and rejected. The arithmetic favoured it heavily: twenty minutes of
Opus mono is around 5 MB per player, while video is three orders of magnitude
larger and is the sole reason the upload path is difficult at all.

It was rejected because the coach reviewing a call needs to see what **that
player** was looking at when they made it. A single feed from one vantage point
cannot answer "what could they actually see here?", which is the question the
board exists to support.

## Consequences

The per-player upload endpoint is load-bearing rather than a convenience, since
per-player video makes a single combined upload impossible by a wide margin.

Video bitrate is a deliberate choice at capture time, not a default. Recording
five simultaneous 1080p screen captures at source quality spends bandwidth and
storage on fidelity the board never displays.

A participant who delivered no video is a supported state throughout — the
backend accepts it, and the board renders it as an explained absence rather than
an error.
