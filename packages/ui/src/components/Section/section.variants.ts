import { tv, type VariantProps } from '../../utils/tv';

export const sectionVariants = tv({
  slots: {
    root: 'min-w-0 text-foreground',
    header: 'grid grid-cols-[1fr_auto] items-start gap-x-4',
    title: 'col-start-1 text-[15px] font-semibold tracking-tight text-foreground',
    description: 'col-start-1 mt-0.5 text-[13px] leading-snug text-muted-foreground',
    actions: 'col-start-2 row-span-2 row-start-1 flex shrink-0 items-center gap-2 self-start',
    body: 'flex min-w-0 flex-col',
  },
  variants: {
    variant: {
      plain: {},
      card: { root: 'rounded-xl border border-border bg-card text-card-foreground shadow-sm' },
      muted: { root: 'rounded-xl border border-border bg-secondary/50' },
    },
    padding: {
      none: { root: 'p-0', header: 'mb-3', body: 'gap-4' },
      sm: { root: 'p-4', header: 'mb-3', body: 'gap-3' },
      md: { root: 'p-5', header: 'mb-4', body: 'gap-4' },
      lg: { root: 'p-6 sm:p-8', header: 'mb-5', body: 'gap-5' },
    },
    divided: {
      true: {
        header: 'border-b border-border',
        body: 'gap-0 divide-y divide-border *:py-4 *:first:pt-0 *:last:pb-0',
      },
    },
  },
  compoundVariants: [
    { divided: true, padding: 'none', class: { header: 'pb-3' } },
    { divided: true, padding: 'sm', class: { header: 'pb-3' } },
    { divided: true, padding: 'md', class: { header: 'pb-4' } },
    { divided: true, padding: 'lg', class: { header: 'pb-5' } },
  ],
  defaultVariants: { variant: 'plain', padding: 'none', divided: false },
});

export type SectionVariantProps = VariantProps<typeof sectionVariants>;
