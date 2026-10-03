import { tv, type VariantProps } from '../../utils/tv';

export const pageVariants = tv({
  slots: {
    root: 'flex min-h-full w-full min-w-0 flex-col',
    inner: 'mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-[26px]',
    header: 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
    titles: 'min-w-0',
    title: 'text-2xl font-bold tracking-tight text-foreground',
    description: 'mt-1 text-[13px] text-muted-foreground',
    actions: 'flex shrink-0 flex-wrap items-center gap-2.5',
    body: 'flex min-w-0 flex-1 flex-col gap-6',
    actionBar: 'sticky bottom-0 z-10 shrink-0 border-t border-border bg-card',
    actionBarInner: 'mx-auto flex w-full flex-wrap items-center justify-end gap-2.5 px-4 py-3 sm:px-6 lg:px-[26px]',
  },
  variants: {
    width: {
      narrow: { inner: 'max-w-[640px]', actionBarInner: 'max-w-[640px]' },
      default: { inner: 'max-w-[1120px]', actionBarInner: 'max-w-[1120px]' },
      wide: { inner: 'max-w-[1440px]', actionBarInner: 'max-w-[1440px]' },
      full: {},
    },
  },
  defaultVariants: { width: 'default' },
});

export type PageVariantProps = VariantProps<typeof pageVariants>;
