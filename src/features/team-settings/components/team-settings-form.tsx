import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { teamSettingsKeys } from '@/features/team-settings/api/get-team-settings';
import {
  updateDeadAirThreshold,
  updateTeamKeywords,
} from '@/features/team-settings/api/update-team-settings';
import { keywordProblem } from '@/features/team-settings/keywords';
import { ApiError } from '@/lib/api-client';
import type { TeamSettings } from '@/types/api';
import styles from './team-settings.module.css';

/** Two endpoints, so two forms rather than one save that could only report half
 *  an outcome. Each puts the server's objection back on the field it names. */

const THRESHOLD_FIELD = 'dead_air_threshold_ms';
const NOT_A_THRESHOLD = 'The threshold is a whole number of milliseconds, at least 1.';

export function DeadAirThresholdForm({ settings }: { settings: TeamSettings }) {
  const [value, setValue] = useState(String(settings.dead_air_threshold_ms));
  const [problem, setProblem] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: updateDeadAirThreshold,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamSettingsKeys.settings });
    },
  });

  const error = save.error instanceof ApiError ? save.error : null;
  const message = problem ?? error?.fieldError(THRESHOLD_FIELD) ?? error?.message ?? null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;

    const milliseconds = Number(value);
    if (!Number.isInteger(milliseconds) || milliseconds < 1) return setProblem(NOT_A_THRESHOLD);

    setProblem(null);
    save.mutate(milliseconds);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.row}>
        <Input
          label="Dead air threshold"
          unit="ms"
          mono
          width="120px"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={save.isPending}
          aria-invalid={message ? true : undefined}
        />
        <Button type="submit" variant="secondary" disabled={save.isPending}>
          Save threshold
        </Button>
      </div>
      {message ? (
        <p className={styles.error} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}

interface Lists {
  informative_keywords: string[];
  declarative_keywords: string[];
}

export function KeywordsForm({ settings }: { settings: TeamSettings }) {
  const [lists, setLists] = useState<Lists>({
    informative_keywords: settings.informative_keywords,
    declarative_keywords: settings.declarative_keywords,
  });
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: updateTeamKeywords,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamSettingsKeys.settings });
    },
  });

  const error = save.error instanceof ApiError ? save.error : null;
  // Anything the server did not pin to a category is about the request itself.
  const formError =
    error && !error.fieldError('informative_keywords') && !error.fieldError('declarative_keywords')
      ? error.message
      : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!save.isPending) save.mutate(lists);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <KeywordEditor
        label="Informative keywords"
        words={lists.informative_keywords}
        otherWords={lists.declarative_keywords}
        serverError={error?.fieldError('informative_keywords')}
        onChange={(words) => setLists((held) => ({ ...held, informative_keywords: words }))}
      />
      <KeywordEditor
        label="Declarative keywords"
        words={lists.declarative_keywords}
        otherWords={lists.informative_keywords}
        serverError={error?.fieldError('declarative_keywords')}
        onChange={(words) => setLists((held) => ({ ...held, declarative_keywords: words }))}
      />

      <div className={styles.row}>
        <Button type="submit" variant="secondary" disabled={save.isPending}>
          Save keywords
        </Button>
      </div>
      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}
    </form>
  );
}

interface KeywordEditorProps {
  label: string;
  words: string[];
  /** The other category, because a word may sit in only one of the two. */
  otherWords: string[];
  serverError?: string;
  onChange: (words: string[]) => void;
}

/** A fieldset rather than a div: the legend is what gives the group its
 *  accessible name, so the two categories are addressable without a test id. */
function KeywordEditor({ label, words, otherWords, serverError, onChange }: KeywordEditorProps) {
  const [draft, setDraft] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  function add() {
    const refusal = keywordProblem(draft, words, otherWords);
    setProblem(refusal);
    if (refusal) return;
    onChange([...words, draft.trim()]);
    setDraft('');
  }

  // The add control sits inside the save form, so Enter would submit it and
  // send the list without the word just typed.
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add();
  }

  const message = problem ?? serverError ?? null;

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>

      {words.length > 0 ? (
        <ul className={styles.words}>
          {words.map((word) => (
            <li key={word.toLowerCase()} className={styles.word}>
              <span>{word}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${word}`}
                onClick={() => onChange(words.filter((held) => held !== word))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.none}>No keywords in this category.</p>
      )}

      <div className={styles.row}>
        <Input
          label={`Add to ${label.toLowerCase()}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          aria-invalid={message ? true : undefined}
        />
        <Button type="button" variant="ghost" onClick={add}>
          Add
        </Button>
      </div>

      {message ? (
        <p className={styles.error} role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
