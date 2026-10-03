import { tv, type VariantProps } from '../../utils/tv';

export const notificationsPopoverVariants = tv({
  slots: {
    trigger: 'relative',
    count: [
      'pointer-events-none absolute -top-1.5 -right-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1',
      'bg-destructive font-mono text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-chrome',
    ],
    popup: 'w-[340px] max-w-[calc(100vw-2rem)]',
    header: 'flex items-center gap-2 border-b border-border py-2 pr-2 pl-3.5',
    title: 'flex-1 text-[13px]',
    unreadPill: 'ml-1.5 rounded-full bg-primary/14 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-chip-text',
    list: 'm-0 max-h-[360px] list-none overflow-y-auto p-1.5',
    row: [
      'flex w-full gap-2.5 rounded-[7px] px-2.5 py-2 text-left',
      'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
    ],
    rowInteractive: 'cursor-pointer transition-colors hover:bg-secondary/60 motion-reduce:transition-none',
    dot: 'mt-1.5 size-[7px] shrink-0 rounded-full',
    body: 'min-w-0 flex-1',
    itemTitle: 'block text-[12.5px] leading-snug text-foreground',
    itemBody: 'mt-0.5 block text-[12px] leading-snug text-muted-foreground',
    time: 'mt-1 block font-mono text-[10px] text-muted-foreground',
    empty: 'flex flex-col items-center gap-2 px-6 py-9 text-center',
    emptyIcon: 'grid size-10 place-items-center rounded-xl bg-secondary text-muted-foreground',
    emptyTitle: 'text-[13px] font-semibold text-foreground',
    emptyText: 'text-[12px] text-muted-foreground',
    footer: 'border-t border-border p-1.5',
  },
  variants: {
    tone: {
      primary: { dot: 'bg-primary' },
      info: { dot: 'bg-info' },
      warning: { dot: 'bg-warning' },
      destructive: { dot: 'bg-destructive' },
    },
    read: {
      true: { dot: 'bg-transparent', itemTitle: 'text-muted-foreground' },
      false: { itemTitle: 'font-semibold' },
    },
  },
  defaultVariants: { tone: 'primary', read: false },
});

export type NotificationsPopoverVariantProps = VariantProps<typeof notificationsPopoverVariants>;
