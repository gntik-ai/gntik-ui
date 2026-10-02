import { tv, type VariantProps } from '../../utils/tv';

export const accordionVariants = tv({
  slots: {
    root: 'flex w-full flex-col divide-y divide-border',
    item: 'data-disabled:opacity-60',
    header: 'm-0',
    trigger: [
      'group flex w-full cursor-pointer items-center gap-3 py-3.5 text-left text-[13px] font-medium text-foreground transition-colors',
      'hover:text-foreground/80 data-disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm',
    ],
    chevron: [
      'ml-auto shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
      'group-data-panel-open:rotate-180',
    ],
    panel: [
      'h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none',
      'data-starting-style:h-0 data-ending-style:h-0',
    ],
    content: 'pb-4 text-[13px] leading-relaxed text-muted-foreground text-pretty',
  },
  variants: {
    variant: {
      /** Dividers only; fills the parent. */
      flush: {},
      /** Inside a bordered card; rows get horizontal padding. */
      card: {
        root: 'overflow-hidden rounded-xl border border-border bg-card',
        trigger: 'px-4 hover:bg-secondary/40 focus-visible:-outline-offset-2 rounded-none',
        content: 'px-4',
      },
    },
  },
  defaultVariants: { variant: 'flush' },
});

export type AccordionVariantProps = VariantProps<typeof accordionVariants>;
