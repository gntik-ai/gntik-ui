import { tv, type VariantProps } from '../../utils/tv';

export const drawerVariants = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-50 bg-background/70 backdrop-blur-[3px] transition-opacity duration-300 motion-reduce:transition-none',
      'opacity-[calc(1-var(--drawer-swipe-progress,0))] data-swiping:duration-0',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
    ],
    viewport: 'fixed inset-0 z-50 flex',
    popup: [
      'relative flex flex-col border-border bg-popover text-popover-foreground shadow-lg outline-none',
      'transition-transform duration-300 ease-out motion-reduce:transition-none data-swiping:duration-0 data-swiping:select-none',
    ],
    content: 'flex min-h-0 flex-1 flex-col',
    handle: 'mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border',
    close: [
      'absolute top-3.5 right-3.5 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors',
      'hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    header: 'flex shrink-0 flex-col gap-0.5 border-b border-border px-5 py-4 pr-14',
    title: 'text-[15px] font-semibold tracking-tight text-foreground',
    description: 'text-[12px] text-muted-foreground text-pretty',
    body: 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5',
    footer: 'flex shrink-0 items-center justify-end gap-2.5 border-t border-border px-5 py-4',
  },
  variants: {
    side: {
      right: {
        viewport: 'items-stretch justify-end',
        popup: [
          'h-full max-w-[88vw] border-l',
          '[transform:translateX(var(--drawer-swipe-movement-x,0px))]',
          'data-starting-style:[transform:translateX(100%)] data-ending-style:[transform:translateX(100%)]',
        ],
      },
      left: {
        viewport: 'items-stretch justify-start',
        popup: [
          'h-full max-w-[88vw] border-r',
          '[transform:translateX(var(--drawer-swipe-movement-x,0px))]',
          'data-starting-style:[transform:translateX(-100%)] data-ending-style:[transform:translateX(-100%)]',
        ],
      },
      bottom: {
        viewport: 'items-end justify-center',
        popup: [
          'w-full rounded-t-xl border-t',
          '[transform:translateY(var(--drawer-swipe-movement-y,0px))]',
          'data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)]',
        ],
      },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { side: ['left', 'right'], size: 'sm', class: { popup: 'w-[284px]' } },
    { side: ['left', 'right'], size: 'md', class: { popup: 'w-[404px]' } },
    { side: ['left', 'right'], size: 'lg', class: { popup: 'w-[560px]' } },
    { side: 'bottom', size: 'sm', class: { popup: 'max-h-[40vh]' } },
    { side: 'bottom', size: 'md', class: { popup: 'max-h-[60vh]' } },
    { side: 'bottom', size: 'lg', class: { popup: 'max-h-[88vh]' } },
  ],
  defaultVariants: { side: 'right', size: 'md' },
});

export type DrawerVariantProps = VariantProps<typeof drawerVariants>;
