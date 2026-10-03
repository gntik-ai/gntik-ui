import { Bell, BellOff, CheckCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../Button';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../Popover';
import { notificationsPopoverVariants } from './notifications-popover.variants';
import { formatRelativeShort, toDate, type TimeInput } from './relative-time';

export interface NotificationItem {
  id: string;
  title: ReactNode;
  body?: ReactNode;
  /** When it happened (Date, epoch ms or ISO string); shown as relative time. */
  time: TimeInput;
  read?: boolean;
  /** Colour of the unread dot. */
  tone?: 'primary' | 'info' | 'warning' | 'destructive';
}

export interface NotificationsPopoverProps {
  className?: string;
  notifications: NotificationItem[];
  /** Makes rows buttons; called with the notification (e.g. mark read + navigate). */
  onSelect?: (notification: NotificationItem) => void;
  /** Shows the "Mark all as read" action while something is unread. */
  onMarkAllRead?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel heading and trigger name. */
  title?: string;
  markAllLabel?: string;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Bottom slot, e.g. a "View all" link. */
  footer?: ReactNode;
  /** Reference time for relative timestamps (defaults to now). */
  now?: Date;
  formatTime?: (time: TimeInput, now: Date) => string;
  /** Trigger name including the unread count. */
  getTriggerLabel?: (unread: number) => string;
}

/**
 * Bell icon button with an unread badge that opens a popover list of notifications
 * (title, body, relative time), a mark-all-read action and an empty state.
 */
export function NotificationsPopover({
  className,
  notifications,
  onSelect,
  onMarkAllRead,
  open,
  defaultOpen,
  onOpenChange,
  title = 'Notifications',
  markAllLabel = 'Mark all as read',
  emptyTitle = "You're all caught up",
  emptyDescription = 'New notifications will show up here.',
  footer,
  now,
  formatTime = formatRelativeShort,
  getTriggerLabel,
}: NotificationsPopoverProps) {
  const s = notificationsPopoverVariants();
  const unread = notifications.filter((n) => !n.read).length;
  const triggerLabel = getTriggerLabel ? getTriggerLabel(unread) : unread ? `${title}, ${unread} unread` : title;
  const reference = now ?? new Date();
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger aria-label={triggerLabel} className={cn(buttonVariants({ variant: 'secondary', iconOnly: true }), s.trigger(), className)}>
        <Bell size={16} aria-hidden />
        {unread > 0 && (
          <span aria-hidden className={s.count()}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" padding="none" className={s.popup()}>
        <div className={s.header()}>
          <PopoverTitle className={s.title()}>
            {title}
            {unread > 0 && <span className={s.unreadPill()}>{unread} new</span>}
          </PopoverTitle>
          {onMarkAllRead && unread > 0 && (
            <Button variant="ghost" size="sm" icon={CheckCheck} onClick={onMarkAllRead}>
              {markAllLabel}
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className={s.empty()}>
            <span className={s.emptyIcon()}>
              <BellOff size={18} aria-hidden />
            </span>
            <p className={s.emptyTitle()}>{emptyTitle}</p>
            <p className={s.emptyText()}>{emptyDescription}</p>
          </div>
        ) : (
          <ul className={s.list()} aria-label={title}>
            {notifications.map((n) => {
              const v = notificationsPopoverVariants({ tone: n.tone, read: Boolean(n.read) });
              const date = toDate(n.time);
              const inner = (
                <>
                  <span aria-hidden className={v.dot()} />
                  <span className={v.body()}>
                    {!n.read && <span className="sr-only">Unread: </span>}
                    <span className={v.itemTitle()}>{n.title}</span>
                    {n.body && <span className={v.itemBody()}>{n.body}</span>}
                    <time dateTime={Number.isNaN(date.getTime()) ? undefined : date.toISOString()} className={v.time()}>
                      {formatTime(n.time, reference)}
                    </time>
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {onSelect ? (
                    <button type="button" className={cn(v.row(), v.rowInteractive())} onClick={() => onSelect(n)}>
                      {inner}
                    </button>
                  ) : (
                    <div className={v.row()}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {footer && <div className={s.footer()}>{footer}</div>}
      </PopoverContent>
    </Popover>
  );
}
