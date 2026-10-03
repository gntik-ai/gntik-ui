import { tv, type VariantProps } from '../../utils/tv';
import { POPOVER_ARROW_SIDES } from '../Popover/popover.variants';

export const tourVariants = tv({
  slots: {
    positioner: 'z-50 outline-none',
    popup: [
      'relative w-[min(22rem,calc(100vw-2rem))] origin-[var(--transform-origin)] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none',
      'transition-[opacity,scale] duration-150 motion-reduce:transition-none',
      'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
    ],
    arrow: ['size-2.5 rotate-45 rounded-[2px] border-border bg-popover', ...POPOVER_ARROW_SIDES],
    counter: 'font-mono text-[10.5px] font-medium tracking-wider text-primary-text uppercase',
    title: 'mt-1 pe-6 text-[14px] font-semibold tracking-tight text-foreground',
    description: 'mt-1.5 text-[12.5px] leading-5 text-muted-foreground text-pretty',
    footer: 'mt-4 flex items-center gap-2',
    skip: 'me-auto',
    close: [
      'absolute end-2 top-2 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors',
      'hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    dots: 'flex items-center gap-1',
    dot: 'size-1.5 rounded-full bg-border data-current:bg-primary',
    highlight: 'pointer-events-none fixed z-40 rounded-lg outline-2 outline-offset-4 outline-focus-ring transition-[top,left,width,height] duration-200 motion-reduce:transition-none',
  },
});

export type TourVariantProps = VariantProps<typeof tourVariants>;
