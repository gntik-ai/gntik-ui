import { tv, type VariantProps } from '../../utils/tv';

export const collapsibleVariants = tv({
  slots: {
    root: 'flex flex-col',
    trigger: [
      'group inline-flex cursor-pointer items-center gap-2 rounded-md text-[13px] font-medium text-foreground transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    chevron: [
      'shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
      'group-data-panel-open:rotate-180',
    ],
    panel: [
      'h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none',
      'data-starting-style:h-0 data-ending-style:h-0',
    ],
    content: 'pt-2 text-[13px] leading-relaxed text-muted-foreground text-pretty',
  },
  variants: {
    variant: {
      /** Compact inline toggle ("Show advanced settings"). */
      subtle: { trigger: 'h-8 -mx-2 px-2 hover:bg-secondary/60' },
      /** Full-width row with a divider, same family as Accordion. */
      row: {
        root: 'border-b border-border',
        trigger: 'w-full justify-between rounded-sm py-3.5 text-left hover:text-foreground/80',
        content: 'pt-0 pb-4',
      },
    },
  },
  defaultVariants: { variant: 'subtle' },
});

export type CollapsibleVariantProps = VariantProps<typeof collapsibleVariants>;
