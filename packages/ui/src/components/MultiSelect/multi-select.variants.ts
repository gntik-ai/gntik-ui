import { tv, type VariantProps } from '../../utils/tv';

/** Extra slots on top of the Combobox house styles (chips field, popup, rows). */
export const multiSelectVariants = tv({
  slots: {
    group: [
      'flex w-full min-w-0 items-center gap-1 pr-1',
      'data-invalid:border-destructive/70 has-[input[aria-invalid=true]]:border-destructive/70',
    ],
    more: 'inline-flex h-6 shrink-0 items-center rounded bg-secondary px-1.5 font-mono text-[11.5px] font-medium text-muted-foreground',
    selectAll: 'mb-1 rounded-b-none border-b border-border font-medium',
    description: 'block truncate text-[11.5px] text-muted-foreground',
    check: 'flex size-4 shrink-0 items-center justify-center text-primary-text',
  },
  variants: {
    size: {
      sm: { group: 'min-h-8 py-0.5 pl-1.5' },
      md: { group: 'min-h-9 py-1 pl-2' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type MultiSelectVariantProps = VariantProps<typeof multiSelectVariants>;
