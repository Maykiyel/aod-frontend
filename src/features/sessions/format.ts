/** How far a processing Session's transcription has got. Failed transcripts are
 *  named rather than hidden: they still count as done, and the figure would
 *  otherwise stall short of its total with no explanation. */
export function formatTranscription(progress: {
  total: number;
  completed: number;
  failed: number;
}): string {
  const done = progress.completed + progress.failed;
  const failed = progress.failed > 0 ? `, ${progress.failed} FAILED` : '';
  return `TRANSCRIBED ${done} OF ${progress.total}${failed}`;
}
