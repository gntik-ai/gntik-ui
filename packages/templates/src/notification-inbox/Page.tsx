import { PageHeader } from '@gntik-ai/blocks';
import { Archive, BellOff, CheckCheck, ExternalLink, MailOpen } from '@gntik-ai/icons';
import {
  Badge,
  Button,
  EmptyState,
  Link,
  Page,
  SplitLayout,
  StatusDot,
  Timestamp,
  Toggle,
  ToggleGroup,
  cn,
  type BreadcrumbItem,
  useI18n,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { inboxBreadcrumbs, inboxCategoryLabels, inboxNotifications, type InboxNotification } from './data';

export type InboxFilter = 'all' | 'unread' | 'mention';

export interface NotificationInboxProps {
  /** Initial notifications, newest first. The page keeps read/archived state locally. */
  notifications: InboxNotification[];
  defaultFilter: InboxFilter;
  /** Initially selected notification (defaults to the first one). */
  defaultSelectedId: string | null;
  onReadChange: (id: string, read: boolean) => void;
  onArchive: (id: string) => void;
  onMarkAllRead: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

const FILTERS: Array<{ value: InboxFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'mention', label: 'Mentions' },
];

const matches = (n: InboxNotification, filter: InboxFilter) =>
  filter === 'all' ? true : filter === 'unread' ? !n.read : n.category === filter;

/** Notification inbox: ConsoleShell + Page + SplitLayout (filtered list → detail, Back below lg). */
export default function NotificationInboxPage(props: Partial<NotificationInboxProps>) {
  const { t } = useI18n();
  const {
    notifications: initial = inboxNotifications,
    defaultFilter = 'all',
    defaultSelectedId,
    onReadChange,
    onArchive,
    onMarkAllRead,
    breadcrumbs = inboxBreadcrumbs,
    currentHref = '/notifications',
    shell,
  } = props;
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<InboxFilter>(defaultFilter);
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId ?? null);
  const [showDetail, setShowDetail] = useState(false);
  const titleId = useId();

  const visible = items.filter((n) => matches(n, filter));
  const selected = items.find((n) => n.id === selectedId) ?? null;
  const unread = items.filter((n) => !n.read).length;

  const setRead = (id: string, read: boolean) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read } : n)));
    onReadChange?.(id, read);
  };
  const open = (n: InboxNotification) => {
    setSelectedId(n.id);
    setShowDetail(true);
    if (!n.read) setRead(n.id, true);
  };
  const archive = (id: string) => {
    setItems((list) => list.filter((n) => n.id !== id));
    setSelectedId(null);
    setShowDetail(false);
    onArchive?.(id);
  };
  const markAllRead = () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const list =
    visible.length === 0 ? (
      <EmptyState
        icon={BellOff}
        size="sm"
        className="mx-auto mt-8"
        title={filter === 'unread' ? 'You’re all caught up' : 'Nothing here yet'}
        description={filter === 'unread' ? t('notifications.empty') : 'Try another filter.'}
      />
    ) : (
      <ul aria-label={t('common.notifications')} className="flex flex-col gap-0.5 p-2">
        {visible.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              aria-current={n.id === selectedId ? 'true' : undefined}
              onClick={() => open(n)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-start hover:bg-accent/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-[current=true]:bg-accent"
            >
              <span className="mt-1.5 flex w-2 shrink-0 justify-center">
                {!n.read && <StatusDot tone={n.tone} aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={cn('min-w-0 flex-1 truncate text-[13px] text-foreground', !n.read && 'font-semibold')}>{n.title}</span>
                  <Timestamp value={n.time} tooltip={false} className="shrink-0 font-mono text-[11px]" />
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{n.preview}</span>
                {!n.read && <span className="sr-only">Unread</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  const detail = selected ? (
    <article aria-labelledby={titleId} className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral" variant="outline">
          {inboxCategoryLabels[selected.category]}
        </Badge>
        <span className="text-[12.5px] text-muted-foreground">
          From <span className="font-medium text-foreground">{selected.from}</span> ·{' '}
          <Timestamp value={selected.time} format="absolute" className="font-mono text-[12px]" />
        </span>
      </div>
      <h2 id={titleId} className="text-[18px] font-semibold tracking-tight text-foreground">
        {selected.title}
      </h2>
      <div className="flex max-w-2xl flex-col gap-3 text-[13.5px] leading-6 text-foreground">
        {selected.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {selected.href && (
          <Button trailingIcon={ExternalLink} render={<Link href={selected.href} tone="inherit" underline="none" />} nativeButton={false}>
            Open
          </Button>
        )}
        <Button variant="secondary" icon={MailOpen} onClick={() => setRead(selected.id, false)}>
          Mark as unread
        </Button>
        <Button variant="ghost" icon={Archive} onClick={() => archive(selected.id)}>
          Archive
        </Button>
      </div>
    </article>
  ) : (
    <EmptyState icon={MailOpen} size="sm" titleAs="h2" className="mx-auto mt-16" title="Select a notification" description="Its details show up here." />
  );

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="full"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Notifications"
            description="Mentions, deployments, billing and access requests across your workspace."
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'Mark all as read', icon: CheckCheck, variant: 'secondary', disabled: unread === 0, onClick: markAllRead }]}
          />
        }
      >
        <div className="h-[640px] min-h-0 overflow-hidden rounded-xl border border-border">
          <SplitLayout
            listLabel="Inbox"
            detailLabel="Notification"
            showDetail={showDetail}
            onShowDetailChange={setShowDetail}
            listHeader={
              <ToggleGroup
                aria-label="Filter notifications"
                size="sm"
                value={[filter]}
                onValueChange={(v) => {
                  const next = v[0];
                  if (next === 'all' || next === 'unread' || next === 'mention') setFilter(next);
                }}
              >
                {FILTERS.map((f) => (
                  <Toggle key={f.value} value={f.value}>
                    {f.label}
                    {f.value === 'unread' && unread > 0 && <span className="font-mono text-[10.5px] text-muted-foreground">{unread}</span>}
                  </Toggle>
                ))}
              </ToggleGroup>
            }
            list={list}
            detail={detail}
          />
        </div>
      </Page>
    </ConsoleShell>
  );
}
