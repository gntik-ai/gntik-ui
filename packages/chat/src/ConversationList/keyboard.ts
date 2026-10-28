import type { ConversationEntry } from './ConversationGroup';

export function navigationTarget(key: string, current: string, entries: ConversationEntry[]): string | undefined {
  const enabled = entries.filter((entry) => entry.kind === 'group' || !entry.item.disabled);
  const index = enabled.findIndex((entry) => entry.key === current);
  if (key === 'Home') return enabled[0]?.key;
  if (key === 'End') return enabled.at(-1)?.key;
  if (key === 'ArrowDown') return enabled[Math.min(index + 1, enabled.length - 1)]?.key;
  if (key === 'ArrowUp') return enabled[Math.max(index - 1, 0)]?.key;
}
