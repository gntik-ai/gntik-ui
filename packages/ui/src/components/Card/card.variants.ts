import { tv, type VariantProps } from '../../utils/tv';

export const cardVariants = tv({
  slots: {
    root: 'overflow-hidden rounded-xl border border-border text-card-foreground',
    header: 'grid grid-cols-[1fr_auto] items-start gap-x-4 px-5 py-4',
    title: 'col-start-1 text-[15px] font-semibold tracking-tight text-foreground',
    description: 'col-start-1 mt-0.5 text-[13px] text-muted-foreground',
    action: 'col-start-2 row-span-2 row-start-1 shrink-0 self-start',
    body: 'px-5 py-4 text-[13px] leading-relaxed text-muted-foreground',
    footer: 'flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/40 px-5 py-3',
  },
  variants: {
    variant: {
      default: { root: 'bg-card shadow-sm' },
      well: { root: 'bg-secondary/50' },
      outline: { root: 'bg-transparent' },
    },
    divided: {
      true: { header: 'border-b border-border' },
    },
  },
  defaultVariants: { variant: 'default', divided: false },
});

export type CardVariantProps = VariantProps<typeof cardVariants>;
