import { useId } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { Icon } from '@/components/ui/icon/icon';
import type { IconName } from '@/components/ui/icon/icon';
import { Surface } from '@/components/ui/surface/surface';
import { Tag } from '@/components/ui/tag/tag';
import type { EnrolmentRole } from '@/features/auth/enrolment';
import { cx } from '@/utils/cx';
import styles from './role-step.module.css';

interface RoleOffer {
  role: EnrolmentRole;
  icon: IconName;
  summary: string;
  affordances: string[];
}

/** Copy read from `docs/design/02 Sign up role.dc.html`. Each plate says what the
 *  role can do, so the choice is made on capability rather than on the name. */
const OFFERS: RoleOffer[] = [
  {
    role: 'Coach',
    icon: 'lens',
    summary: 'Run sessions for a roster and review the timeline afterwards.',
    affordances: ['CREATE + SCHEDULE SESSIONS', 'FULL ROSTER TIMELINE', 'ANNOTATE + EXPORT REPORTS'],
  },
  {
    role: 'Player',
    icon: 'role',
    summary: 'Join sessions your coach sets up and see your own read-back.',
    affordances: ['JOIN ASSIGNED SESSIONS', 'OWN TIMELINE ONLY', 'MIC + CONSENT CONTROL'],
  },
];

export interface RoleStepProps {
  role: EnrolmentRole | null;
  onChange: (role: EnrolmentRole) => void;
  onContinue: () => void;
}

/** Screen 02. The plates are a radio group: two mutually exclusive choices with
 *  keyboard semantics the drawn div pair cannot offer. */
export function RoleStep({ role, onChange, onContinue }: RoleStepProps) {
  const group = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onContinue();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.plates}>
        <legend className={styles.legend}>Account type</legend>

        {OFFERS.map((offer) => (
          <RolePlate
            key={offer.role}
            offer={offer}
            group={group}
            selected={role === offer.role}
            onSelect={() => onChange(offer.role)}
          />
        ))}
      </fieldset>

      <div className={styles.actions}>
        <Button type="submit">Continue</Button>
        <Link className={styles.backLink} to="/login">
          Back to log in
        </Link>
      </div>
    </form>
  );
}

function RolePlate({
  offer,
  group,
  selected,
  onSelect,
}: {
  offer: RoleOffer;
  group: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const nameId = `${group}-${offer.role}`;

  return (
    <div className={cx(styles.plate, selected ? styles.selected : null)}>
      <input
        type="radio"
        className={styles.control}
        name={group}
        value={offer.role}
        checked={selected}
        onChange={onSelect}
        aria-labelledby={nameId}
      />

      {/* Selection lifts the plate a rung, which is what draws its second groove
          and, with `.selected`, reddens the edge the ladder already owns. */}
      <Surface level={selected ? 2 : 1} behind="var(--void)" className={styles.surface}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.glyph}>
              <Icon name={offer.icon} size={20} className={styles.glyphIcon} />
            </span>
            {selected ? <Tag tone="alert">SELECTED</Tag> : null}
          </div>

          <div className={styles.naming}>
            <span className={styles.name} id={nameId}>
              {offer.role}
            </span>
            <p className={styles.summary}>{offer.summary}</p>
          </div>

          <ul className={styles.affordances}>
            {offer.affordances.map((affordance) => (
              <li key={affordance} className={styles.affordance}>
                <span className={styles.affordanceMark} aria-hidden="true" />
                {affordance}
              </li>
            ))}
          </ul>
        </div>
      </Surface>

      {selected ? (
        <>
          <span className={cx(styles.corner, styles.cornerTopLeft)} aria-hidden="true" />
          <span className={cx(styles.corner, styles.cornerBottomRight)} aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}
