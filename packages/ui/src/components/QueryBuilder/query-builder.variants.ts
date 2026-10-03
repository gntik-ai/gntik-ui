import { tv, type VariantProps } from '../../utils/tv';

/**
 * Nested groups as bordered cards (each level one step deeper in tone), a combinator switch per
 * group, and condition rows that wrap on narrow screens.
 */
export const queryBuilderVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-3',
    group: 'flex min-w-0 flex-col gap-2.5 rounded-lg border border-border p-3',
    groupHeader: 'flex flex-wrap items-center justify-between gap-2',
    list: 'flex min-w-0 flex-col gap-2',
    item: 'flex min-w-0 items-start gap-2',
    joiner: 'mt-2 w-9 shrink-0 text-center font-mono text-[10.5px] font-semibold text-muted-foreground',
    condition: 'flex min-w-0 flex-1 flex-wrap items-center gap-2',
    fieldSelect: 'w-40',
    operatorSelect: 'w-40',
    value: 'flex min-w-0 flex-1 flex-wrap items-center gap-2',
    valueControl: 'min-w-36 flex-1',
    empty: 'text-[12.5px] text-muted-foreground',
    footer: 'flex flex-wrap items-center gap-2',
    preview: 'rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-[12px] text-foreground',
  },
  variants: {
    depth: {
      0: { group: 'bg-card' },
      1: { group: 'bg-secondary/30' },
      2: { group: 'bg-secondary/50' },
    },
  },
  defaultVariants: { depth: 0 },
});

export type QueryBuilderVariantProps = VariantProps<typeof queryBuilderVariants>;
