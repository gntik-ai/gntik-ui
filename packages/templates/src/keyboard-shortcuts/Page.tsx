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
  useHotkeys,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useRef, useState, type ReactElement } from 'react';
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
  const sheet = useRef<HTMLDivElement>(null);
  useHotkeys({ '/': () => sheet.current?.querySelector('input')?.focus() });
  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={description}
            status=""
            meta={[]}
            tabs={null}
            actions={[]}
          />
        }
      >
        <div ref={sheet}>
          <ShortcutSheet groups={groups} />
        </div>
        <KeyboardShortcutsDialog groups={groups} title={title} trigger={null} />
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
  const [openState, setOpenState] = useState(defaultOpen ?? false);
  const content = useRef<HTMLDivElement>(null);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  useHotkeys({ '?': () => setOpen(true) });
  useHotkeys({ '/': () => content.current?.querySelector('input')?.focus() }, { ref: content });
  return (
    <Dialog open={open ?? openState} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger}>{title}</DialogTrigger>}
      <DialogContent size="lg" ref={content}>
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
