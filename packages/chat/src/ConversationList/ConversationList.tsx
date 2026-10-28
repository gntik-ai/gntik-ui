import { Button, Kbd, cn } from '@gntik-ai/ui';
import { useLayoutEffect, useRef, useState } from 'react';
import { useChatI18n } from '../utils/i18n';
import { ConversationGroup, type ConversationEntry } from './ConversationGroup';
import { ConversationRow } from './ConversationRow';
import { conversationGroups, type RecencyKey } from './groupByRecency';
import { useConversationWindow } from './useConversationWindow';
import { navigationTarget } from './keyboard';
import { conversationListStyles as s } from './conversationList.variants';
import type { ConversationListProps } from './types';

export function ConversationList({
  items,
  activeId,
  defaultActiveId = null,
  onActiveChange,
  virtualizeAt = 100,
  onNew,
  newShortcut,
  hasMore,
  loadingMore,
  onLoadMore,
  getHref,
  onRename,
  onDelete,
  itemActions,
  label,
  emptyState,
  groupBy = 'recency',
  now = new Date(),
  className,
  collapsedGroups,
  defaultCollapsedGroups = [],
  onCollapsedGroupsChange,
}: ConversationListProps) {
  const { tc } = useChatI18n();
  const [innerActive, setInnerActive] = useState(defaultActiveId);
  const active = activeId === undefined ? innerActive : activeId;
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsedGroups);
  const collapsed = collapsedGroups ?? innerCollapsed;
  const toggle = (key: string) => {
    const next = collapsed.includes(key) ? collapsed.filter((value) => value !== key) : [...collapsed, key];
    if (collapsedGroups === undefined) setInnerCollapsed(next);
    onCollapsedGroupsChange?.(next);
  };
  const entries: ConversationEntry[] = conversationGroups(items, groupBy, now).flatMap((group) => {
    const rows: ConversationEntry[] = group.items.map((item) => ({ kind: 'row', key: `row:${item.id}`, item }));
    if (groupBy === false) return rows;
    const heading: ConversationEntry = {
      kind: 'group',
      key: `group:${group.key}`,
      groupKey: group.key,
      label: groupBy === 'recency' ? tc(`chat.${group.key as RecencyKey}`) : group.key,
      collapsed: collapsed.includes(group.key),
    };
    return [heading, ...(heading.collapsed ? [] : rows)];
  });
  const enabled = entries.filter((entry) => entry.kind === 'group' || !entry.item.disabled);
  const initial =
    enabled.find((entry) => entry.kind === 'row' && entry.item.id === active) ??
    enabled.find((entry) => entry.kind === 'row') ??
    enabled[0];
  const [focused, setFocused] = useState<{ key: string; active: string | null } | null>(null);
  const tabKey =
    focused?.active === active && enabled.some((entry) => entry.key === focused.key) ? focused.key : initial?.key;
  const virtual = items.length > virtualizeAt;
  const { indices, win, setViewport, setScrollTop, measure, reveal } = useConversationWindow(entries, tabKey, virtual);
  const controls = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef(false);
  useLayoutEffect(() => {
    if (pendingFocus.current && tabKey) {
      controls.current.get(tabKey)?.focus({ preventScroll: virtual });
      pendingFocus.current = false;
    }
  });
  const register = (key: string, node: HTMLElement | null) => {
    if (node) controls.current.set(key, node);
    else controls.current.delete(key);
  };
  return (
    <div className={cn(s.root, className)}>
      {onNew && (
        <Button variant="secondary" className="mx-2 shrink-0" onClick={onNew}>
          {tc('chat.newChat')}
          {newShortcut && <Kbd>{newShortcut}</Kbd>}
        </Button>
      )}
      <nav
        ref={setViewport}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        aria-label={label ?? tc('chat.conversations')}
        className={s.nav}
        onKeyDown={(event) => {
          const current = (event.target as HTMLElement).dataset.conversationKey;
          if (!current) return;
          const key = navigationTarget(event.key, current, entries);
          if (key) {
            event.preventDefault();
            pendingFocus.current = true;
            reveal(key);
            setFocused({ key, active });
          }
        }}
      >
        <div className="relative" style={virtual ? { height: win.total } : undefined}>
          {indices.map((index) => {
            const entry = entries[index]!;
            return (
              <div
                key={entry.key}
                ref={(node) => measure(entry.key, node)}
                className={virtual ? 'absolute inset-x-0 top-0' : undefined}
                style={virtual ? { transform: `translateY(${win.offsets[index] ?? 0}px)` } : undefined}
              >
                {entry.kind === 'group' ? (
                  <ConversationGroup
                    key={entry.key}
                    entry={entry}
                    controlRef={(node) => register(entry.key, node)}
                    tabIndex={entry.key === tabKey ? 0 : -1}
                    onFocus={() => setFocused({ key: entry.key, active })}
                    onToggle={() => toggle(entry.groupKey)}
                  />
                ) : (
                  <ConversationRow
                    key={entry.key}
                    item={entry.item}
                    now={now}
                    onRename={onRename}
                    onDelete={onDelete}
                    itemActions={itemActions}
                    current={entry.item.id === active}
                    controlRef={(node) => register(entry.key, node)}
                    tabIndex={entry.key === tabKey ? 0 : -1}
                    onFocus={() => setFocused({ key: entry.key, active })}
                    href={getHref?.(entry.item)}
                    onActivate={() => {
                      if (activeId === undefined) setInnerActive(entry.item.id);
                      onActiveChange?.(entry.item.id);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {items.length === 0 && emptyState}
      </nav>
      {hasMore && (
        <Button
          variant="ghost"
          className="mx-2 shrink-0"
          loading={loadingMore}
          onClick={() => {
            if (!loadingMore) onLoadMore?.();
          }}
        >
          {tc('chat.loadMore')}
        </Button>
      )}
    </div>
  );
}
