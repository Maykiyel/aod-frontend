import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { Surface } from '@/components/ui/surface/surface';
import styles from './drawer.module.css';

export interface DrawerProps {
  /** Names the dialog, and heads it. */
  title: string;
  /** The control that opens it. Rendered as the trigger itself. */
  trigger: ReactNode;
  children: ReactNode;
}

/** A blocking panel off the right edge. Radix supplies the focus trap, the
 *  escape handling and the scroll lock AOD Comms does not ship; the tokens
 *  supply the look, at E4 over `--scrim` — the rung HANDOFF.md reserves for one
 *  modal at a time, and what it names Radix for. */
export function Drawer({ title, trigger, children }: DrawerProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.scrim} />
        {/* No description: the title and the fields say what this is. */}
        <Dialog.Content asChild aria-describedby={undefined}>
          <Surface level={4} behind="var(--void)" padding="0" className={styles.panel}>
            <header className={styles.head}>
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              <Dialog.Close className={styles.close} aria-label="Close">
                <Icon name="close" size={14} />
              </Dialog.Close>
            </header>

            <div className={styles.body}>{children}</div>
          </Surface>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
