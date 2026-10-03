import { tv, type VariantProps } from '../../utils/tv';

export const listInputVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    head: 'grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2 px-0.5 font-mono text-[10.5px] font-medium tracking-wider text-muted-foreground uppercase',
    list: 'flex flex-col gap-2',
    row: 'flex flex-col gap-1',
    fields: 'grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-2',
    keyInput: 'font-mono',
    valueInput: 'font-mono',
    actions: 'flex items-center gap-0.5',
    error: 'ps-0.5 text-[11.5px] text-destructive-text',
    footer: 'flex items-center gap-2',
    hint: 'ms-auto text-[11.5px] text-muted-foreground',
  },
});

export type ListInputVariantProps = VariantProps<typeof listInputVariants>;
