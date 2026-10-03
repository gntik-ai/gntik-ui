import { tv, type VariantProps } from '../../utils/tv';
import { POPOVER_ARROW_SIDES } from '../Popover/popover.variants';

export const hoverCardVariants = tv({
  slots: {
    trigger: [
      'cursor-pointer rounded-sm font-medium text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors motion-reduce:transition-none',
      'hover:decoration-foreground data-popup-open:decoration-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    positioner: 'z-50 outline-none',
    popup: [
      'relative w-72 origin-[var(--transform-origin)] rounded-[10px] border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
      'max-w-[calc(100vw-2rem)] transition-[opacity,scale] duration-150 motion-reduce:transition-none',
      'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
    ],
    arrow: ['size-2.5 rotate-45 rounded-[2px] border-border bg-popover', ...POPOVER_ARROW_SIDES],
  },
});

export type HoverCardVariantProps = VariantProps<typeof hoverCardVariants>;
