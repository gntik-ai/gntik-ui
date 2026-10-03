import { PageHeader } from '@gntik-ai/blocks';
import { Keyboard } from '@gntik-ai/icons';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Page,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import type { ReactElement } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { shortcutBreadcrumbs, shortcutGroups, type ShortcutGroup } from './data';
import { ShortcutSheet } from './ShortcutSheet';

export interface KeyboardShortcutsProps {
  title: string;
  description: string;
  groups: ShortcutGroup[];
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Keyboard shortcuts as a console page: ConsoleShell + Page with a searchable sheet. */
export default function KeyboardShortcutsPage(props: Partial<KeyboardShortcutsProps>) {
  const {
    title = 'Keyboard shortcuts',
    description = 'Move around the console without leaving the keyboard. Press ? anywhere to open this list.',
    groups = shortcutGroups,
    breadcrumbs = shortcutBreadcrumbs,
    currentHref = '/help/shortcuts',
    shell,
  } = props;
  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} tabs={null} actions={[]} />}>
        <ShortcutSheet groups={groups} />
      </Page>
    </ConsoleShell>
  );
}

export interface KeyboardShortcutsDialogProps {
  groups?: ShortcutGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger element (rendered through Base UI `render`); omit for a controlled dialog opened by `?`. */
  trigger?: ReactElement | null;
  title?: string;
}

/** The same sheet in a Dialog, for the `?` shortcut or a help menu item. */
export function KeyboardShortcutsDialog({
  groups = shortcutGroups,
  open,
  defaultOpen,
  onOpenChange,
  trigger = <Button variant="secondary" icon={Keyboard} />,
  title = 'Keyboard shortcuts',
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger}>{title}</DialogTrigger>}
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Search by action or key.</DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          <ShortcutSheet groups={groups} headingLevel={3} columns={1} autoFocus />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
