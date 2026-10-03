import { tv, type VariantProps } from '../../utils/tv';

export const bottomSheetVariants = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-50 bg-background/70 backdrop-blur-[3px] transition-opacity duration-300 motion-reduce:transition-none',
      'opacity-[calc(1-var(--drawer-swipe-progress,0))] data-swiping:duration-0',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
    ],
    viewport: 'fixed inset-0 z-50 flex items-end justify-center',
    popup: [
      'relative flex max-h-[calc(100dvh-1rem)] min-h-0 w-full max-w-2xl flex-col rounded-t-2xl border border-b-0 border-border bg-popover text-popover-foreground shadow-lg outline-none',
      '[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
      '[padding-bottom:max(0px,calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]',
      'transition-transform duration-300 ease-out motion-reduce:transition-none data-swiping:duration-0 data-swiping:select-none',
      'data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)]',
    ],
    handleArea: 'flex shrink-0 justify-center pt-2 pb-1 touch-none',
    handle: [
      'group grid h-6 w-16 cursor-grab place-items-center rounded-full active:cursor-grabbing',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    handleBar: 'h-1 w-10 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/60 motion-reduce:transition-none',
    header: 'flex shrink-0 flex-col gap-0.5 border-b border-border px-5 pt-1 pb-3 pe-14',
    title: 'text-[15px] font-semibold tracking-tight text-foreground',
    description: 'text-[12px] text-muted-foreground text-pretty',
    content: 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 touch-auto',
    footer: 'flex shrink-0 items-center justify-end gap-2.5 border-t border-border px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]',
    close: [
      'absolute end-3 top-3 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors',
      'hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
  },
});

export type BottomSheetVariantProps = VariantProps<typeof bottomSheetVariants>;
