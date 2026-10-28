import { Badge, Input, MoreMenu, type MoreMenuAction } from '@gntik-ai/ui';
import { useEffect, useState, useRef, type Ref } from 'react';
import { useChatI18n } from '../utils/i18n';
import { groupByRecency } from './groupByRecency';
import { conversationListStyles as s } from './conversationList.variants';
import type { ConversationListProps, ConversationSummary } from './types';

export interface ConversationRowProps {
  item: ConversationSummary;
  now: Date;
  current: boolean;
  tabIndex: number;
  href?: string;
  controlRef: Ref<HTMLButtonElement | HTMLAnchorElement>;
  onFocus: () => void;
  onActivate: () => void;
  onRename?: ConversationListProps['onRename'];
  onDelete?: ConversationListProps['onDelete'];
  itemActions?: ConversationListProps['itemActions'];
}

export function ConversationRow({
  item,
  now,
  current,
  tabIndex,
  href,
  controlRef,
  onFocus,
  onActivate,
  onRename,
  onDelete,
  itemActions,
}: ConversationRowProps) {
  const { formatDate, tc, t, dir } = useChatI18n();
  const root = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLButtonElement | null>(null);
  const focusRow = () => root.current?.querySelector<HTMLElement>('[data-conversation-key]')?.focus();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const input = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!editing && !restoreFocus.current) return;
    const frame = requestAnimationFrame(() => {
      if (editing) {
        input.current?.focus();
        input.current?.select();
      } else {
        root.current?.querySelector<HTMLElement>('[data-conversation-key]')?.focus();
        restoreFocus.current = false;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [editing]);
  const startRename = () => {
    if (!item.disabled && onRename) {
      setDraft(item.title);
      setEditing(true);
    }
  };
  const finishRename = (save: boolean) => {
    const title = draft.trim();
    if (save && title && title !== item.title) onRename?.(item.id, title);
    restoreFocus.current = true;
    setEditing(false);
  };
  const menu: MoreMenuAction[] = [
    ...(onRename ? [{ label: tc('chat.rename'), onSelect: startRename }] : []),
    ...(onDelete ? [{ label: t('common.delete'), destructive: true, onSelect: () => onDelete(item.id) }] : []),
    ...(itemActions?.(item) ?? []),
  ];
  const title = editing ? (
    <Input
      ref={input}
      aria-label={tc('chat.rename')}
      size="sm"
      value={draft}
      onValueChange={setDraft}
      onBlur={() => setEditing(false)}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'Enter' || event.key === 'Escape') {
          event.preventDefault();
          finishRename(event.key === 'Enter');
        }
      }}
    />
  ) : (
    item.title
  );
  const contents = (
    <>
      {item.icon}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className={s.title}>{title}</span>
        </span>{' '}
        {item.preview && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.preview}</span>}
      </span>{' '}
      {(item.unread ?? 0) > 0 && (
        <Badge tone="primary" size="sm" aria-label={tc('chat.unreadCount', { count: item.unread ?? 0 })}>
          {item.unread}
        </Badge>
      )}{' '}
      <time
        className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground"
        dateTime={new Date(item.updatedAt).toISOString()}
      >
        {formatDate(
          item.updatedAt,
          groupByRecency(item.updatedAt, now) === 'today' ? { timeStyle: 'short' } : { dateStyle: 'short' },
        )}
      </time>
    </>
  );
  const props = {
    'data-conversation-key': `row:${item.id}`,
    'aria-current': current ? ('true' as const) : undefined,
    'aria-disabled': item.disabled || undefined,
    tabIndex,
    className: s.row,
    onFocus,
    onClick: (event: React.MouseEvent) => {
      if (item.disabled) event.preventDefault();
      else onActivate();
    },
  };
  const row = editing ? (
    <div className={s.row}>{contents}</div>
  ) : href !== undefined ? (
    <a
      {...props}
      ref={controlRef as Ref<HTMLAnchorElement>}
      href={href}
      onKeyDown={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
          if (!item.disabled) event.currentTarget.click();
        }
      }}
    >
      {contents}
    </a>
  ) : (
    <button {...props} ref={controlRef as Ref<HTMLButtonElement>} type="button" disabled={item.disabled}>
      {contents}
    </button>
  );
  return (
    <div
      className="group flex items-center gap-1"
      ref={(node) => {
        root.current = node;
        actions.current = node?.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]') ?? null;
        if (actions.current) {
          actions.current.tabIndex = -1;
          actions.current.disabled = !!item.disabled;
        }
      }}
      onKeyDown={(event) => {
        if (item.disabled) return;
        if (event.target === actions.current) {
          if (event.key === 'Escape' || event.key === (dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft')) {
            event.preventDefault();
            event.stopPropagation();
            focusRow();
          }
        } else if ((event.target as HTMLElement).dataset.conversationKey) {
          if (event.key === (dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight')) {
            event.preventDefault();
            actions.current?.focus();
          } else if (event.key === 'F2' && onRename) {
            event.preventDefault();
            startRename();
          }
        }
      }}
    >
      {row}
      <MoreMenu
        label={tc('chat.conversationActions', { title: item.title })}
        items={menu}
        variant="ghost"
        size="sm"
        className="shrink-0 opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:hover)]:opacity-0"
      />
    </div>
  );
}
