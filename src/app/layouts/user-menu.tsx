import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HexSlot } from '@/components/ui/hex-slot/hex-slot';
import { Surface } from '@/components/ui/surface/surface';
import styles from './user-menu.module.css';

function initialsOf(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export interface UserMenuProps {
  username: string;
  /** The membership reading under the name, or null when there is none to give. */
  reading: string | null;
  onLogout: () => void;
}

/** The profile block, and the account actions behind it. E3 is the rung the
 *  design reserves for popovers; Radix supplies the focus handling, escape and
 *  outside-click that the design system has no component for. */
export function UserMenu({ username, reading, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.trigger}>
        <HexSlot
          initials={initialsOf(username)}
          state="active"
          width={34}
          height={38}
          aria-hidden="true"
        />
        <span className={styles.text}>
          <span className={styles.name}>{username}</span>
          {reading ? <span className={styles.role}>{reading}</span> : null}
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" align="start" sideOffset={8} asChild>
          <Surface level={3} behind="var(--e1-surface)" padding="0" className={styles.content}>
            <DropdownMenu.Item className={styles.item} onSelect={onLogout}>
              Log out
            </DropdownMenu.Item>
          </Surface>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
