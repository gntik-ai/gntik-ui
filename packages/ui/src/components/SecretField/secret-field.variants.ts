import { tv, type VariantProps } from '../../utils/tv';

export const secretFieldVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-1.5',
    row: 'flex min-w-0 items-center gap-2',
    field: 'min-w-0 flex-1 pe-1',
    input: 'font-mono tracking-wide',
    actions: 'flex shrink-0 items-center gap-0.5',
    toggle: 'size-7 shrink-0',
    meta: 'flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] leading-4 text-muted-foreground',
    metaItem: 'inline-flex items-center gap-1',
    status: 'sr-only',
  },
  variants: {
    size: {
      auto: { input: 'text-[12.5px]' },
      sm: { input: 'text-[12px]', toggle: 'size-6' },
      md: { input: 'text-[12.5px]' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type SecretFieldVariantProps = VariantProps<typeof secretFieldVariants>;
