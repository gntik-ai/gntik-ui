/**
 * Built-in rows the kit adds to a combobox list: "Create “…”" (creatable) and "Retry" (after a
 * failed async load). They are real options, so the keyboard reaches them like any other row,
 * but selecting one never becomes the value.
 */
export interface SpecialItem {
  readonly __gntikSpecial: 'create' | 'retry';
  /** The typed text: selecting the row leaves the input as it was. */
  readonly value: string;
  readonly label: string;
}

export const createItem = (input: string): SpecialItem => ({ __gntikSpecial: 'create', value: input, label: input });
export const retryItem = (input: string): SpecialItem => ({ __gntikSpecial: 'retry', value: input, label: input });

export function isSpecialItem(item: unknown): item is SpecialItem {
  return !!item && typeof item === 'object' && '__gntikSpecial' in item;
}

/** `{ label }` → label, otherwise `String(item)` (Base UI's default for `{ value, label }` items). */
export function defaultItemLabel(item: unknown): string {
  if (item && typeof item === 'object' && 'label' in item) return String((item as { label: unknown }).label);
  return item == null ? '' : String(item);
}

/** `{ value }` → value, otherwise `String(item)`. */
export function defaultItemValue(item: unknown): string {
  if (item && typeof item === 'object' && 'value' in item) return String((item as { value: unknown }).value);
  return item == null ? '' : String(item);
}

/** Whether an option label already equals the typed text (case-insensitive). */
export function hasExactLabel<Item>(items: readonly Item[], input: string, toLabel: (item: Item) => string): boolean {
  const q = input.trim().toLocaleLowerCase();
  return items.some((item) => !isSpecialItem(item) && toLabel(item).trim().toLocaleLowerCase() === q);
}
