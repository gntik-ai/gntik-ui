import { tv, type VariantProps } from '../../utils/tv';
import { listboxItem, listboxPopup } from '../Select/select.variants';

export const workspaceSwitcherVariants = tv({
  slots: {
    trigger: [
      'group flex h-11 max-w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-card pr-2.5 pl-1.5 text-left transition-colors',
      'hover:bg-secondary/50 data-popup-open:bg-secondary/50 motion-reduce:transition-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    triggerText: 'flex min-w-0 flex-col leading-tight',
    triggerName: 'truncate text-[13px] font-semibold text-foreground',
    triggerMeta: 'mt-px truncate font-mono text-[10px] text-muted-foreground',
    triggerChevron: 'ml-1 shrink-0 text-muted-foreground',
    popup: 'min-w-[252px]',
    option: 'h-11 px-2',
    optionBody: 'flex min-w-0 items-center gap-2.5',
    optionText: 'flex min-w-0 flex-col leading-tight',
    optionName: 'truncate text-[12.5px] font-medium text-foreground',
    optionMeta: 'truncate font-mono text-[9.5px] text-muted-foreground',
    // Searchable (combobox) popup
    searchPopup: [listboxPopup, 'w-[280px] p-0'],
    searchField: 'flex items-center gap-2 border-b border-border px-3',
    searchIcon: 'shrink-0 text-muted-foreground',
    searchInput: 'h-10 w-full min-w-0 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground',
    searchList: 'max-h-[300px] overflow-y-auto p-1.5 outline-none',
    searchItem: [listboxItem, 'h-11 px-2'],
    searchIndicator: 'ml-auto flex shrink-0 text-primary-text',
    searchEmpty: 'px-3 py-4 text-center text-[12.5px] text-muted-foreground empty:hidden',
    createIcon: 'grid size-[30px] shrink-0 place-items-center rounded-md border border-dashed border-border text-muted-foreground',
  },
});

export type WorkspaceSwitcherVariantProps = VariantProps<typeof workspaceSwitcherVariants>;
