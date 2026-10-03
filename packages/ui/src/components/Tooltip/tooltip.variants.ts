import { tv, type VariantProps } from '../../utils/tv';

export const tooltipVariants = tv({
  slots: {
    positioner: 'z-50',
    popup: [
      'relative origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 motion-reduce:transition-none',
      'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-instant:transition-none',
    ],
    arrow: [
      'size-2 rotate-45 rounded-[1px]',
      'data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-end-1 data-[side=right]:-start-1',
    ],
    kbd: 'ms-1.5 rounded bg-background/20 px-1 py-px font-mono text-[10px] tracking-wide text-background',
  },
  variants: {
    variant: {
      /** Short label: inverted solid chip. */
      solid: {
        popup: 'flex items-center rounded-md bg-foreground px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-background shadow-md',
        arrow: 'bg-foreground',
      },
      /** Multi-line content on the popover surface. */
      rich: {
        popup: 'w-64 rounded-lg border border-border bg-popover p-3 text-start text-[12.5px] leading-5 text-popover-foreground shadow-lg',
        arrow: [
          'border-border bg-popover',
          'data-[side=top]:border-e data-[side=top]:border-b data-[side=bottom]:border-t data-[side=bottom]:border-s',
          'data-[side=left]:border-t data-[side=left]:border-e data-[side=right]:border-b data-[side=right]:border-s',
        ],
      },
    },
  },
  defaultVariants: { variant: 'solid' },
});

export type TooltipVariantProps = VariantProps<typeof tooltipVariants>;
