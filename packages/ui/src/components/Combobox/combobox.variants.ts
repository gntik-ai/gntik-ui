import { tv, type VariantProps } from '../../utils/tv';
import { listboxItem, listboxPopup } from '../Select/select.variants';

const field = [
  'rounded-md border border-border bg-background text-foreground shadow-sm transition-colors',
  'focus-within:border-primary/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
  'has-[input[data-disabled]]:cursor-not-allowed has-[input[data-disabled]]:opacity-50',
];

export const comboboxVariants = tv({
  slots: {
    label: 'mb-2 block text-[13px] font-medium text-foreground',
    inputGroup: [...field, 'flex items-center pr-1 pl-3'],
    searchIcon: 'shrink-0 text-muted-foreground',
    input: 'w-full min-w-0 bg-transparent pr-1 pl-2.5 text-foreground outline-none placeholder:text-muted-foreground',
    iconButton: [
      'grid size-7 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-focus-ring',
    ],
    chevron: 'transition-transform motion-reduce:transition-none group-data-popup-open:rotate-180',
    chipsGroup: [...field, 'cursor-text px-2 py-1.5'],
    chips: 'flex w-full flex-wrap items-center gap-1.5',
    chip: [
      'inline-flex h-6 items-center gap-1 rounded bg-primary/14 pr-1 pl-2 text-[12px] font-medium text-primary-chip-text outline-none',
      'data-highlighted:bg-primary/24 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
    ],
    chipRemove: 'grid size-4 place-items-center rounded transition-colors hover:bg-primary/20',
    chipsInput: 'h-6 min-w-20 flex-1 bg-transparent px-1 text-[13px] text-foreground outline-none placeholder:text-muted-foreground',
    positioner: 'z-50 outline-none',
    popup: listboxPopup,
    list: 'outline-none data-empty:hidden',
    item: listboxItem,
    itemContent: 'flex min-w-0 flex-1 items-center gap-2',
    indicator: 'flex shrink-0 text-primary-text',
    empty: 'px-2.5 py-3 text-center text-[12.5px] text-muted-foreground empty:hidden',
  },
  variants: {
    size: {
      sm: { input: 'h-8 text-[12.5px]' },
      md: { input: 'h-9 text-[13px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type ComboboxVariantProps = VariantProps<typeof comboboxVariants>;
