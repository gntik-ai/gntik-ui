import { tv, type VariantProps } from '../../utils/tv';

export const canvasLayoutVariants = tv({
  slots: {
    root: 'relative flex flex-col overflow-hidden bg-background font-sans text-foreground',
    skipLink: 'focus:absolute',
    header: 'flex h-12 shrink-0 items-center gap-3 border-b border-border bg-chrome px-3',
    headerContent: 'flex min-w-0 flex-1 items-center gap-3',
    toggles: 'hidden shrink-0 items-center gap-1 lg:flex',
    body: 'flex min-h-0 flex-1',
    palette: 'hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-card lg:flex',
    inspector: 'hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card lg:flex',
    panelTitle: 'flex h-10 shrink-0 items-center border-b border-border px-3 font-mono text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase',
    panelBody: 'flex-1 p-3',
    center: 'flex min-w-0 flex-1 flex-col',
    main: 'relative min-h-0 flex-1 overflow-hidden outline-none',
    notice: [
      'absolute top-3 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 lg:hidden',
      'rounded-md border border-border bg-card px-3 py-2 text-[12.5px] text-muted-foreground shadow-sm',
    ],
    toolbar: 'absolute top-3 left-1/2 z-10 hidden -translate-x-1/2 lg:block',
    console: 'flex shrink-0 flex-col border-t border-border bg-card',
    consoleBar: 'flex h-9 shrink-0 items-center gap-2 px-2',
    consoleToggle: [
      'inline-flex h-7 items-center gap-1.5 rounded-md px-2 font-mono text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase',
      'transition-colors hover:bg-secondary hover:text-foreground motion-reduce:transition-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    consoleChevron: 'transition-transform motion-reduce:transition-none',
    consoleActions: 'ml-auto flex items-center gap-1',
    consoleBody: 'h-40 overflow-y-auto border-t border-border font-mono text-[12px]',
  },
  variants: {
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
    consoleOpen: {
      true: { consoleChevron: 'rotate-0' },
      false: { consoleChevron: '-rotate-90' },
    },
  },
  defaultVariants: { fullScreen: false, consoleOpen: true },
});

export type CanvasLayoutVariantProps = VariantProps<typeof canvasLayoutVariants>;
