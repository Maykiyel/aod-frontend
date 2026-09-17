# Open questions

Things this codebase does that nobody has yet proved right. Not decisions — those
are in `docs/adr/` — and not work, which is in the issue tracker. Each entry says
what is believed, why it is not settled, and what would settle it.

Delete an entry when it is answered, and move what it taught into an ADR if the
answer changed a decision.

## An audio-only WebM may not pass the upload endpoint's MIME rule

**Believed:** `POST /sessions/{session}/recording` accepts the audio file
`MediaRecorder` produces, which `src/features/sessions/api/upload-recording.ts`
sends as `audio/webm`.

**Why it is not settled:** the backend validates with Laravel's `mimetypes:` rule
(`StoreSessionRecordingRequest`), which sniffs file content rather than trusting
the client's declared type. WebM is a Matroska container, and libmagic commonly
reports `video/webm` for one whether or not it carries a video track. If it does
that here, an audio-only WebM is rejected against the `audio` field, and a player
delivers video and nothing else — a failure that only shows up on the Review
Board, with the audio the whole analysis runs on missing.

Neither side covers it. No backend test uploads WebM at all; every one of them
uses `UploadedFile::fake()`, which reports the type it was handed and never
sniffs. On this side the boundary is mocked, so nothing exercises the real rule.

**What would settle it:** one real upload from a browser to a running backend. If
the rule rejects it, the fix is the backend's — `audio/webm` files sniffing as
`video/webm` is a property of the container, not something a client can dress up
— and it belongs on `Joe-Zupo/aod-backend` beside #24 and #25.

## Screens 10 and 11 have not been checked against their references at 1440px

**Believed:** the recording Screen matches the design references, less the two
device columns no endpoint can supply (#7's last-but-one criterion).

**Why it is not settled:** every value comes from a token and the structure
follows `10 Recording player.dc.html` and `11 Recording coach.dc.html`, but
nobody has put the two side by side. The Screen cannot be driven without a
microphone and a shared window, and `pnpm dev` uses the repo owner's own signed-in
session, so an agent cannot reach it.

**What would settle it:** the repo owner opening the preview at 1440px on a
started session, as a player and as a coach.
