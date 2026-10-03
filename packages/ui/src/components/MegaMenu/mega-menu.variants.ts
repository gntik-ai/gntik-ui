import { tv, type VariantProps } from '../../utils/tv';

export const megaMenuVariants = tv({
  slots: {
    root: 'relative min-w-0',
    list: 'flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]',
    trigger: [
      'group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors select-none',
      'hover:bg-accent/45 hover:text-foreground data-popup-open:bg-accent/45 data-popup-open:text-foreground motion-reduce:transition-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-current:font-semibold data-current:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent-foreground',
    ],
    chevron: 'transition-transform duration-200 group-data-popup-open:rotate-180 motion-reduce:transition-none',
    positioner: [
      'z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]',
      'transition-[top,left,right,bottom] duration-300 ease-out data-instant:transition-none motion-reduce:transition-none',
    ],
    popup: [
      'relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none',
      'transition-[opacity,scale,width,height] duration-300 ease-out motion-reduce:transition-none',
      'data-starting-style:scale-[0.97] data-starting-style:opacity-0 data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-ending-style:duration-150',
    ],
    viewport: 'relative h-full w-full overflow-hidden',
    content: [
      'flex h-full w-[calc(100vw-2rem)] flex-col gap-4 p-4 sm:w-max sm:max-w-[min(56rem,calc(100vw-2rem))] sm:flex-row',
      'transition-opacity duration-300 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
    ],
    columns: 'grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-[repeat(var(--mega-cols),minmax(13rem,1fr))]',
    section: 'flex min-w-0 flex-col gap-1',
    sectionTitle: 'px-2.5 pb-1 font-mono text-[10.5px] font-medium tracking-wider text-muted-foreground uppercase',
    links: 'flex flex-col gap-0.5',
    link: [
      'flex min-w-0 items-start gap-3 rounded-lg px-2.5 py-2 text-start no-underline transition-colors motion-reduce:transition-none',
      'hover:bg-secondary/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
      'data-active:bg-primary/10',
    ],
    linkIcon: 'mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground',
    linkText: 'flex min-w-0 flex-col',
    linkLabel: 'text-[13px] font-medium text-foreground',
    linkDescription: 'text-[12px] leading-[1.45] text-muted-foreground text-pretty',
    featured: 'flex shrink-0 flex-col sm:w-60',
  },
});

export type MegaMenuVariantProps = VariantProps<typeof megaMenuVariants>;
