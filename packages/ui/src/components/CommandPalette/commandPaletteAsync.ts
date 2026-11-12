import type { CommandEntry, CommandEntryGroup, CommandGroup, CommandItem } from './command-filter';

/** Key of the built-in Retry option; it cannot clash with an item id (those never start with a NUL). */
export const RETRY_KEY = '\u0000retry';

/** The trailing group that holds the Retry option after a failed load. It has no heading. */
export function retryGroup(label: string): CommandEntryGroup {
  const item: CommandItem = { id: RETRY_KEY, label };
  return { value: '', items: [{ key: RETRY_KEY, item }] };
}

export const isRetryEntry = (entry: CommandEntry) => entry.key === RETRY_KEY;

/**
 * Appends the loaded groups after the static ones, keeping the server's order for headings and
 * items. An item whose id is already visible (or already listed in an earlier loaded group) is
 * skipped, so ids stay unique; groups left empty are dropped.
 */
export function appendLoadedGroups(visible: CommandEntryGroup[], loaded: readonly CommandGroup[]): CommandEntryGroup[] {
  if (!loaded.length) return visible;
  const seen = new Set(visible.flatMap((g) => g.items.map((e) => e.item.id)));
  const extra: CommandEntryGroup[] = [];
  for (const group of loaded) {
    const items: CommandEntry[] = [];
    for (const item of group.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push({ key: item.id, item });
    }
    if (items.length) extra.push({ value: group.label, items });
  }
  return [...visible, ...extra];
}
