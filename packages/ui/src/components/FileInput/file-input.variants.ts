import { tv } from '../../utils/tv';

export const fileInputVariants = tv({
  slots: {
    root: 'flex min-w-0 items-center gap-2',
    control:
      'focus-ring text-start focus-visible:border-primary/60 disabled:cursor-disabled disabled:bg-secondary/50 disabled:text-muted-foreground disabled:opacity-60 aria-invalid:border-destructive/70 forced-colors:aria-invalid:border-[Mark] forced-colors:disabled:text-[GrayText]',
    value: 'flex min-w-0 items-center gap-2',
    placeholder: 'text-muted-foreground',
    name: 'truncate',
    size: 'shrink-0 text-muted-foreground',
    icon: 'shrink-0 text-muted-foreground',
  },
});
