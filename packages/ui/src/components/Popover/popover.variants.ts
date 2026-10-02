import { tv, type VariantProps } from '../../utils/tv';

/** Arrow placement per side: a rotated square showing the two border edges that face out. */
export const POPOVER_ARROW_SIDES = [
  'data-[side=bottom]:-top-[5px] data-[side=bottom]:border-t data-[side=bottom]:border-l',
  'data-[side=top]:-bottom-[5px] data-[side=top]:border-r data-[side=top]:border-b',
  'data-[side=left]:-right-[5px] data-[side=left]:border-t data-[side=left]:border-r',
  'data-[side=right]:-left-[5px] data-[side=right]:border-b data-[side=right]:border-l',
];

export const popoverVariants = tv({
  slots: {
    positioner: 'z-50 outline-none',
    popup: [
      'relative origin-[var(--transform-origin)] rounded-[10px] border border-border bg-popover text-popover-foreground shadow-md outline-none',
      'max-w-[calc(100vw-2rem)] transition-[opacity,scale] duration-150 motion-reduce:transition-none',
      'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
    ],
    arrow: ['size-2.5 rotate-45 rounded-[2px] border-border bg-popover', ...POPOVER_ARROW_SIDES],
    title: 'text-[13px] font-semibold tracking-tight text-foreground',
    description: 'mt-1 text-[12.5px] leading-5 text-muted-foreground text-pretty',
    close: [
      'absolute top-2 right-2 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors',
      'hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    padding: {
      none: { popup: 'p-0' },
      sm: { popup: 'p-1.5' },
      md: { popup: 'p-3.5' },
    },
  },
  defaultVariants: { padding: 'md' },
});

export type PopoverVariantProps = VariantProps<typeof popoverVariants>;
