import {
  CommandPalette,
  CommandPaletteTrigger,
  useI18n,
  type CommandGroup,
  type CommandItem,
  type CommandPaletteProps,
  type CommandPaletteStore,
} from '@gntik-ai/ui';
import { useRef } from 'react';
import { globalSearchActions, globalSearchPages, globalSearchRecent, globalSearchRecords } from './fixtures';

export type GlobalSearchGroup = 'pages' | 'records' | 'actions' | 'recent';

export interface GlobalSearchProps {
  pages?: CommandItem[];
  records?: CommandItem[];
  actions?: CommandItem[];
  /** Shown first while the query is empty. */
  recent?: CommandItem[];
  /** Called with every chosen item and the group it came from (after the item's own onSelect). */
  onSelect?: (item: CommandItem, group: GlobalSearchGroup) => void;
  /** Group headings. */
  labels?: Partial<Record<GlobalSearchGroup, string>>;
  /** Registers ⌘K on macOS/iOS and Ctrl+K on other platforms. */
  shortcut?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Text of the trigger button. */
  triggerLabel?: string;
  /** Classes for the trigger (e.g. `hidden md:inline-flex`). */
  className?: string;
  /**
   * Loads server-side results (agents, runs, tenants…) for the query, debounced and abortable.
   * A chosen loaded item is reported to `onSelect` with the group `records`.
   */
  loadItems?: CommandPaletteProps['loadItems'];
  /** Wait (ms) after the last keystroke before `loadItems`. Default 250. */
  debounceMs?: number;
  /** Fewest trimmed characters before `loadItems` runs. Default 1. */
  minQueryLength?: number;
  /** Called with every typed query and with `''` when opening resets it. */
  onQueryChange?: (query: string) => void;
  /** Opens and closes the search from code; see `createCommandPaletteStore`. It wins over `open`. */
  store?: CommandPaletteStore;
}

/** ⌘K search: a CommandPalette pre-wired with recent items and Pages / Records / Actions groups. */
export function GlobalSearch({
  pages = globalSearchPages,
  records = globalSearchRecords,
  actions = globalSearchActions,
  recent = globalSearchRecent,
  onSelect,
  labels,
  shortcut = true,
  open,
  defaultOpen,
  onOpenChange,
  placeholder: placeholderProp,
  triggerLabel: triggerLabelProp,
  className,
  loadItems,
  debounceMs,
  minQueryLength,
  onQueryChange,
  store,
}: GlobalSearchProps) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t('globalSearch.placeholder');
  const triggerLabel = triggerLabelProp ?? t('common.search');
  const l: Record<GlobalSearchGroup, string> = {
    pages: labels?.pages ?? t('globalSearch.pages'),
    records: labels?.records ?? t('globalSearch.records'),
    actions: labels?.actions ?? t('globalSearch.actions'),
    recent: labels?.recent ?? t('commandPalette.recent'),
  };
  const origin = new Map<string, GlobalSearchGroup>();
  const tag = (items: CommandItem[], group: GlobalSearchGroup) => {
    for (const item of items) if (!origin.has(item.id)) origin.set(item.id, group);
    return items;
  };
  const groups: CommandGroup[] = [
    { label: l.pages, items: tag(pages, 'pages') },
    { label: l.records, items: tag(records, 'records') },
    { label: l.actions, items: tag(actions, 'actions') },
  ].filter((g) => g.items.length > 0);
  for (const item of recent) if (!origin.has(item.id)) origin.set(item.id, 'recent');
  // Ids returned by loadItems; the static `origin` map above is never touched by them.
  const loadedIds = useRef(new Set<string>());
  const loadAndTag: CommandPaletteProps['loadItems'] = loadItems
    ? async (query, context) => {
        const loaded = await loadItems(query, context);
        for (const group of loaded) for (const item of group.items) loadedIds.current.add(item.id);
        return loaded;
      }
    : undefined;
  return (
    <CommandPalette
      groups={groups}
      recent={recent}
      recentLabel={l.recent}
      shortcut={shortcut}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placeholder={placeholder}
      label={t('globalSearch.label')}
      loadItems={loadAndTag}
      debounceMs={debounceMs}
      minQueryLength={minQueryLength}
      onQueryChange={onQueryChange}
      store={store}
      onSelect={(item) =>
        onSelect?.(item, origin.get(item.id) ?? (loadedIds.current.has(item.id) ? 'records' : 'recent'))
      }
    >
      <CommandPaletteTrigger className={className}>{triggerLabel}</CommandPaletteTrigger>
    </CommandPalette>
  );
}
