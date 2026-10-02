import { tv, type VariantProps } from '../../utils/tv';

/**
 * Semantic table. Borders live on the cells (border-separate) so a sticky header keeps its
 * bottom rule while the body scrolls underneath.
 */
export const tableVariants = tv({
  slots: {
    container: 'relative w-full overflow-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    table: 'w-full border-separate border-spacing-0 text-left text-[13px] text-foreground',
    header: '',
    body: '[&>tr:last-child>td]:border-b-0',
    footer: 'font-medium [&>tr>td]:border-t [&>tr>td]:border-b-0 [&>tr>td]:border-border [&>tr>td]:bg-secondary/30',
    row: 'transition-colors motion-reduce:transition-none hover:bg-accent/30 data-[selected]:bg-primary/8 data-[selected]:hover:bg-primary/12',
    head: 'border-b border-border px-4 align-middle text-[11.5px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase',
    sortButton: [
      'inline-flex cursor-pointer items-center gap-1 rounded-sm uppercase tracking-wide transition-colors motion-reduce:transition-none hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    cell: 'border-b border-border px-4 align-middle',
    caption: 'caption-bottom px-4 py-3 text-left text-[12px] text-muted-foreground',
  },
  variants: {
    density: {
      compact: { head: 'h-9', cell: 'py-2' },
      comfortable: { head: 'h-10', cell: 'py-3' },
    },
    sticky: {
      true: { head: 'sticky top-0 z-10 bg-card' },
      false: { head: 'bg-secondary/30' },
    },
    align: {
      left: { head: 'text-left', cell: 'text-left' },
      right: { head: 'text-right', cell: 'text-right tabular-nums', sortButton: 'flex-row-reverse' },
      center: { head: 'text-center', cell: 'text-center' },
    },
    active: {
      true: { sortButton: 'text-foreground' },
    },
  },
  defaultVariants: { density: 'comfortable', sticky: false, align: 'left' },
});

export type TableVariantProps = VariantProps<typeof tableVariants>;
export type TableDensity = NonNullable<TableVariantProps['density']>;
export type SortDirection = 'ascending' | 'descending' | 'none';

/** Next aria-sort value when a sortable header is activated: none → ascending ⇄ descending. */
export function nextSortDirection(current: SortDirection): Exclude<SortDirection, 'none'> {
  return current === 'ascending' ? 'descending' : 'ascending';
}
