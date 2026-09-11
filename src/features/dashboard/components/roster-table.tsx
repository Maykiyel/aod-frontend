import { HexSlot } from '@/components/ui/hex-slot/hex-slot';
import { Tag } from '@/components/ui/tag/tag';
import { formatCount, NO_READING } from '@/features/dashboard/format';
import type { PlayerLine } from '@/features/dashboard/types';
import styles from './roster-table.module.css';

/** The two-character player key the hex slot carries. */
function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

/**
 * What a coach is shown: one line per active non-coach member, pooled over the
 * same sessions as the team-wide numbers. No absence column — dead air is
 * team-wide by definition, so there is no per-player figure to put there.
 */
export function RosterTable({ players }: { players: PlayerLine[] }) {
  const online = players.filter((player) => player.is_online).length;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Team members</h2>
        <span className={styles.count}>
          {formatCount(players.length)} ON ROSTER · {formatCount(online)} ONLINE
        </span>
      </div>

      <div className={styles.scroll}>
        <table className={styles.table} aria-label="Team members">
          <thead>
            <tr>
              <th scope="col" className={styles.player}>
                PLAYER
              </th>
              <th scope="col" className={styles.figure}>
                COMMS/MIN
              </th>
              <th scope="col" className={styles.figure}>
                ALIGN RATE
              </th>
              <th scope="col" className={styles.figure}>
                CALLS
              </th>
              <th scope="col" className={styles.figure}>
                SESSIONS
              </th>
              <th scope="col" className={styles.state}>
                STATE
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.user_id}>
                <th scope="row" className={styles.player}>
                  {/* The flex lives on a wrapper: display:flex on a th drops its
                      cell role in the accessibility tree. */}
                  <div className={styles.playerCell}>
                    <HexSlot
                      initials={initials(player.username)}
                      state={player.is_online ? 'active' : 'offline'}
                      width={44}
                      height={50}
                    />
                    <span className={styles.username}>{player.username}</span>
                  </div>
                </th>
                <td className={styles.figure}>{player.comm_frequency}</td>
                <td className={styles.figure}>
                  {player.alignment_rate === null ? NO_READING : `${player.alignment_rate}%`}
                </td>
                <td className={styles.figure}>{formatCount(player.calls_logged)}</td>
                <td className={styles.figure}>{formatCount(player.sessions_played)}</td>
                <td className={styles.state}>
                  <Tag tone={player.is_online ? 'aligned' : 'neutral'}>
                    {player.is_online ? 'ONLINE' : 'OFFLINE'}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
