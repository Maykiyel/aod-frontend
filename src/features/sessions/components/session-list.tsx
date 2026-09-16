import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Surface } from '@/components/ui/surface/surface';
import { Tag } from '@/components/ui/tag/tag';
import { formatSessionDate, formatTranscription } from '@/features/sessions/format';
import { sessionState } from '@/features/sessions/session-state';
import type { Session } from '@/types/api';
import styles from './session-list.module.css';

export interface SessionListProps {
  /** The panel's heading, and the list's accessible name. */
  label: string;
  /** Already ordered — the live Session first, then the rest as the server
   *  returned them. This component never re-orders. */
  sessions: Session[];
  /** An onward link, when the surface showing the list is a summary of it. */
  action?: ReactNode;
}

/** The team's Sessions, one item each. The dashboard rail's drawn item treatment,
 *  which the Sessions Screen takes widened — the design set carries no Screen of
 *  its own for a Sessions list (spec #33). */
export function SessionList({ label, sessions, action }: SessionListProps) {
  return (
    <Surface level={2} behind="var(--void)" padding="0" className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        {action}
      </div>
      {sessions.length > 0 ? (
        <ul className={styles.items} aria-label={label}>
          {sessions.map((session) => (
            <SessionListItem key={session.id} session={session} />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>NO SESSIONS LOGGED</p>
      )}
    </Surface>
  );
}

/** Name, a meta line of date and Session code, and the state tag. The per-item
 *  statistics row screens 06 and 07 draw is dropped, as #6 records. */
function SessionListItem({ session }: { session: Session }) {
  const state = sessionState(session.status);

  return (
    <li className={styles.item}>
      <Link to={`/sessions/${session.id}`} className={styles.link}>
        <span className={styles.identity}>
          <span className={styles.name}>{session.session_name}</span>
          <span className={styles.meta}>
            <span>{formatSessionDate(session.created_at)}</span>
            {session.session_code ? (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.code}>{session.session_code}</span>
              </>
            ) : null}
            {session.transcription ? (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.code}>{formatTranscription(session.transcription)}</span>
              </>
            ) : null}
          </span>
        </span>
        <Tag tone={state.tone} dot={state.dot}>
          {state.label}
        </Tag>
      </Link>
    </li>
  );
}
