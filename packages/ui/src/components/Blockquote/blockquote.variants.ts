import { tv, type VariantProps } from '../../utils/tv';

export const blockquoteVariants = tv({
  slots: {
    root: 'm-0 min-w-0',
    quote: 'm-0 text-foreground text-pretty',
    mark: 'shrink-0 text-primary-text',
    caption: 'mt-3 flex min-w-0 items-center gap-2.5 text-[12.5px] text-muted-foreground',
    avatar: 'shrink-0',
    source: 'flex min-w-0 flex-col',
    name: 'truncate font-semibold text-foreground not-italic',
    detail: 'truncate',
    link: 'underline underline-offset-2 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  },
  variants: {
    variant: {
      /** Inline-start rule, for quotes inside prose. */
      default: { root: 'border-s-2 border-primary/70 ps-4', quote: 'text-[14px] leading-6' },
      /** A card for testimonials and feedback. */
      card: { root: 'rounded-xl border border-border bg-card p-5 shadow-sm', quote: 'text-[14px] leading-6' },
      /** Large, centred pull quote for editorial pages. */
      pull: { root: 'mx-auto max-w-2xl text-center', quote: 'text-[19px] leading-8 font-medium tracking-tight', caption: 'justify-center' },
    },
  },
  defaultVariants: { variant: 'default' },
});

export type BlockquoteVariantProps = VariantProps<typeof blockquoteVariants>;
