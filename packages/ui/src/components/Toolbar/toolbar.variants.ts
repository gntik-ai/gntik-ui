import { tv, type VariantProps } from '../../utils/tv';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

export const toolbarVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 items-center gap-2',
    group: 'flex items-center gap-1',
    lane: 'flex min-w-0 items-center gap-2',
    separator: 'mx-1 h-4 w-px shrink-0 bg-border',
    inputWrap: 'relative min-w-0 flex-1',
    inputIcon: 'pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground',
    input: [
      'h-8 w-full min-w-[150px] rounded-md border border-border bg-background px-2.5 text-[12.5px] text-foreground transition-colors',
      'placeholder:text-muted-foreground hover:border-ring/50',
      focusRing,
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    link: ['inline-flex h-8 items-center rounded-md px-1.5 text-[12.5px] font-medium text-primary-text underline-offset-4 hover:underline', focusRing],
  },
  variants: {
    variant: {
      /** Full-width action bar above a table or list. */
      bar: { root: 'border-b border-border bg-secondary/20 px-3 py-2.5' },
      /** Self-contained floating group (e.g. formatting controls). */
      floating: { root: 'w-auto inline-flex rounded-lg border border-border bg-card p-1 shadow-sm gap-1' },
      /** No chrome; lays out items only. */
      plain: {},
    },
    lane: {
      start: { lane: 'mr-auto' },
      center: { lane: 'mx-auto justify-center' },
      end: { lane: 'ml-auto justify-end' },
    },
  },
  defaultVariants: { variant: 'bar', lane: 'start' },
});

export type ToolbarVariantProps = VariantProps<typeof toolbarVariants>;
