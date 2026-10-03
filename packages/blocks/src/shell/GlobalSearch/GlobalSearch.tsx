import { CommandPalette, CommandPaletteTrigger, type CommandGroup, type CommandItem, useI18n } from '@gntik-ai/ui';
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
  /** Registers ⌘K / Ctrl+K. */
  shortcut?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Text of the trigger button. */
  triggerLabel?: string;
  /** Classes for the trigger (e.g. `hidden md:inline-flex`). */
  className?: string;
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
      onSelect={(item) => onSelect?.(item, origin.get(item.id) ?? 'recent')}
    >
      <CommandPaletteTrigger className={className}>{triggerLabel}</CommandPaletteTrigger>
    </CommandPalette>
  );
}
