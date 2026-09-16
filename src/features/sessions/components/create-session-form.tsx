import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button/button';
import { Icon } from '@/components/ui/icon/icon';
import { Input } from '@/components/ui/input/input';
import {
  createSession,
  SESSION_NAME_MAX_LENGTH,
} from '@/features/sessions/api/create-session';
import { sessionKeys } from '@/features/sessions/api/get-sessions';
import { ApiError } from '@/lib/api-client';
import type { Session } from '@/types/api';
import styles from './create-session-form.module.css';

const FIELD_ID = 'create-session-name';
const FIELD_ERROR_ID = 'create-session-name-error';

/** Naming a Session is the whole of creating one, so it is an inline form in the
 *  Screen's header rather than a route or a dialog (spec #33). */
export function CreateSessionForm({ teamId }: { teamId: number }) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (sessionName: string) => createSession(teamId, sessionName),
    onSuccess: async () => {
      setName('');
      await queryClient.invalidateQueries({ queryKey: sessionKeys.index(teamId) });
    },
  });

  const error = create.error instanceof ApiError ? create.error : null;
  const fieldError = error?.fieldError('session_name');
  // Anything the server did not pin to the field is about the request itself —
  // a second active session is the one that actually happens.
  const formError = error && !fieldError ? error.message : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sessionName = name.trim();
    if (!sessionName || create.isPending) return;
    create.mutate(sessionName);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <Input
            id={FIELD_ID}
            label="SESSION NAME"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={SESSION_NAME_MAX_LENGTH}
            disabled={create.isPending}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? FIELD_ERROR_ID : undefined}
          />
        </div>
        <Button type="submit" icon={<Icon name="add" size={13} />} disabled={create.isPending}>
          Create session
        </Button>
      </div>

      {fieldError ? (
        <p className={styles.error} id={FIELD_ERROR_ID} role="alert">
          {fieldError}
        </p>
      ) : null}
      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}
    </form>
  );
}

/** Why the control is not here. A Capability hides a control and never grants one
 *  (ADR 0007), so the form above still handles the server's own refusal. */
export function ActiveSessionNotice({ session }: { session: Session }) {
  return (
    <p className={styles.notice}>
      A team runs one session at a time.{' '}
      <span className={styles.code}>{session.session_code}</span> is still open.
    </p>
  );
}
