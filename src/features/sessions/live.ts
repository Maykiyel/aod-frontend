/** The Session's live channel, as `routes/channels.php` and `app/Events` name
 *  them. None of the five events declares `broadcastAs()`, so the wire name is
 *  the full class name — which Echo addresses with a leading dot (spec #38). */

export const sessionChannel = (sessionId: number) => `session.${sessionId}`;

/** `String.raw` rather than escaped backslashes: the class separator is a
 *  literal `\`, and one dropped escape fails silently on the wire. */
export const SESSION_EVENTS = {
  participantJoined: String.raw`.App\Events\SessionParticipantJoined`,
  participantLeft: String.raw`.App\Events\SessionParticipantLeft`,
  participantStatusChanged: String.raw`.App\Events\SessionParticipantStatusChanged`,
  sessionStatusChanged: String.raw`.App\Events\SessionStatusChanged`,
  // The fifth, added by aod-backend ADR 0015 after spec #40 was written: it is
  // what moves a Coach's delivery column without polling.
  participantRecordingUploaded: String.raw`.App\Events\SessionParticipantRecordingUploaded`,
} as const;
