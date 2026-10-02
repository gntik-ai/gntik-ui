import { tv, type VariantProps } from '../../utils/tv';

export const fieldVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2 data-disabled:opacity-70',
    label: 'inline-flex items-center gap-0.5 text-[13px] font-medium text-foreground data-disabled:cursor-not-allowed',
    required: 'text-destructive-text',
    description: 'text-[12px] leading-5 text-muted-foreground text-pretty',
    error: 'flex items-start gap-1.5 text-[12px] leading-5 text-destructive-text',
    item: 'flex',
    fieldset: 'm-0 flex min-w-0 flex-col gap-3 border-0 p-0 data-disabled:opacity-70',
    legend: 'p-0 text-[13px] font-semibold text-foreground',
    legendDescription: '-mt-2 text-[13px] leading-6 text-muted-foreground text-pretty',
  },
});

export type FieldVariantProps = VariantProps<typeof fieldVariants>;
