import { EmptyState, EmptyStateInstruction } from '@/components/states/empty-state/empty-state';
import { formatTranscription } from '@/features/sessions/format';
import type { Session } from '@/types/api';

/** The Session read endpoint refuses a processing Session with a conflict, so
 *  its name and progress come from the team index — the one place a processing
 *  Session is still listed. `session` is absent when it is past the first page. */
export function ProcessingSession({ session }: { session?: Session }) {
  const progress = session?.transcription;

  return (
    <EmptyState
      eyebrow={session?.session_code ?? 'Session'}
      title={session?.session_name ?? 'Processing'}
      reading={progress ? formatTranscription(progress) : 'SESSION:PROCESSING'}
    >
      <EmptyStateInstruction>
        Analysis is running on this session. It opens once every transcript has
        reached a terminal state.
      </EmptyStateInstruction>
    </EmptyState>
  );
}
