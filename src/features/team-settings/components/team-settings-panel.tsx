import { useQuery } from '@tanstack/react-query';
import { Drawer } from '@/components/drawer/drawer';
import { RailPanel, RailReading, RailReadings } from '@/components/rail-panel/rail-panel';
import { InlineError } from '@/components/states/inline-error/inline-error';
import { Skeleton } from '@/components/states/skeleton/skeleton';
import { Button } from '@/components/ui/button/button';
import { teamSettingsQuery } from '@/features/team-settings/api/get-team-settings';
import {
  DeadAirThresholdForm,
  KeywordsForm,
} from '@/features/team-settings/components/team-settings-form';
import type { TeamSettings } from '@/types/api';
import styles from './team-settings.module.css';

/** Said in both places, because the drawer covers the rail that says it first. */
const TEAM_WIDE =
  'These tune detection for every session this team runs, not only this one. Changing them never re-runs a session already analysed.';

/** The team's detection settings as a module, not lobby markup: the endpoints
 *  are team-wide and `/settings` will compose this same panel rather than
 *  rebuild it (spec #38). Readings are the resting state; editing is a drawer. */
export function TeamSettingsPanel() {
  const settings = useQuery(teamSettingsQuery);

  return (
    <RailPanel title="Team settings">
      <p className={styles.note}>{TEAM_WIDE}</p>

      {settings.isPending ? <Skeleton label="Loading the team settings" /> : null}

      {settings.error ? (
        <InlineError message={settings.error.message} onRetry={() => void settings.refetch()} />
      ) : null}

      {settings.data ? <SettingsBody settings={settings.data} /> : null}
    </RailPanel>
  );
}

function SettingsBody({ settings }: { settings: TeamSettings }) {
  return (
    <>
      <RailReadings>
        <RailReading term="Dead air threshold" value={`${settings.dead_air_threshold_ms} ms`} />
        <RailReading
          term="Informative keywords"
          value={wordCount(settings.informative_keywords.length)}
        />
        <RailReading
          term="Declarative keywords"
          value={wordCount(settings.declarative_keywords.length)}
        />
      </RailReadings>

      {/* Editing is a blocking panel rather than an expansion: the two forms
          are longer than the rail, and the rail is beside a live grid. */}
      <Drawer
        title="Team settings"
        trigger={
          <Button variant="ghost" className={styles.toggle}>
            Edit settings
          </Button>
        }
      >
        <p className={styles.note}>{TEAM_WIDE}</p>
        <DeadAirThresholdForm settings={settings} />
        <KeywordsForm settings={settings} />
      </Drawer>
    </>
  );
}

const wordCount = (count: number) => `${count} ${count === 1 ? 'WORD' : 'WORDS'}`;
