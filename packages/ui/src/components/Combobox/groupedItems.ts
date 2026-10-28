/** Base UI's grouped collection shape, shared by Combobox and MultiSelect. */
export interface OptionGroup<Item> {
  value?: string;
  items: readonly Item[];
}

export function isGroup<Item = unknown>(item: unknown): item is OptionGroup<Item> {
  return !!item && typeof item === 'object' && Array.isArray((item as { items?: unknown }).items);
}
