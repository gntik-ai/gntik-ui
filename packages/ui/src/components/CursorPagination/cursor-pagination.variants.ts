import { tv } from '../../utils/tv';

export const cursorPaginationVariants = tv({
  slots: {
    root: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between focus-ring',
    selectGroup: 'flex items-center gap-2.5',
    selectLabel: 'text-[12.5px] text-muted-foreground',
    select: 'w-[76px] font-mono',
    controls: 'flex flex-wrap items-center gap-3',
    status: 'text-[12.5px] text-muted-foreground tabular-nums',
  },
});
