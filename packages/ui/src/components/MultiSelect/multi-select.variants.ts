import { tv, type VariantProps } from '../../utils/tv';

/** Extra slots on top of the Combobox house styles (chips field, popup, rows). */
export const multiSelectVariants = tv({
  slots: {
    group: [
      'flex w-full min-w-0 items-center gap-1 pe-1',
      'data-invalid:border-destructive/70 has-[input[aria-invalid=true]]:border-destructive/70',
    ],
    chip: '',
    input: '',
    iconButton: '',
    more: 'inline-flex h-6 shrink-0 items-center rounded bg-secondary px-1.5 font-mono text-[11.5px] font-medium text-muted-foreground',
    selectAll: 'mb-1 rounded-b-none border-b border-border font-medium',
    description: 'block truncate text-[11.5px] text-muted-foreground',
    check: 'flex size-4 shrink-0 items-center justify-center text-primary-text',
  },
  variants: {
    size: {
      lg: {
        group: 'min-h-11 py-1.5 ps-4 text-[14.5px] rounded-lg',
        chip: 'h-7 text-[13px]',
        more: 'h-7 text-[13px]',
        input: 'h-7 text-[14.5px]',
      },
      // Reserve exactly one density chip row plus the field's two 1px borders.
      auto: {
        group: 'min-h-(--control-h-md) py-[calc((var(--control-h-md)-var(--chip-h)-2px)/2)] ps-field',
        chip: 'h-chip',
        more: 'h-chip',
        input: 'h-chip',
        iconButton: 'size-(--chip-h)',
      },
      sm: { group: 'min-h-8 py-0.5 ps-1.5' },
      md: { group: 'min-h-9 py-1 ps-2' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type MultiSelectVariantProps = VariantProps<typeof multiSelectVariants>;
