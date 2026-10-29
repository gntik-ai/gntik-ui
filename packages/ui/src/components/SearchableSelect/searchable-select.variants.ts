import { tv } from '../../utils/tv';

export const searchableSelectVariants = tv({
  slots: {
    label: 'mb-2 block text-[13px] font-medium text-foreground',
    optionText: 'flex min-w-0 flex-col',
    description: 'truncate text-[12px] text-muted-foreground',
    icon: 'shrink-0 text-muted-foreground',
  },
});
