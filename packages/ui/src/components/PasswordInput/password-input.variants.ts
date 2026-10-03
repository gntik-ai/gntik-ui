import { tv, type VariantProps } from '../../utils/tv';

/** Segmented strength bar under the field: 4 segments filled by score, coloured by level. */
export const passwordInputVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    toggle: 'size-7 shrink-0',
    meter: 'flex flex-col gap-1.5',
    segments: 'grid grid-cols-4 gap-1',
    segment: 'h-1 rounded-full bg-secondary transition-colors motion-reduce:transition-none',
    text: 'text-[12px] leading-4 text-muted-foreground',
    level: 'font-medium',
  },
  variants: {
    level: {
      0: { level: 'text-destructive-text' },
      1: { level: 'text-destructive-text' },
      2: { level: 'text-warning-text' },
      3: { level: 'text-success-text' },
      4: { level: 'text-success-text' },
    },
  },
});

/** Fill class for a filled segment at each score. */
export const PASSWORD_SEGMENT_FILL = ['bg-destructive', 'bg-destructive', 'bg-warning', 'bg-success', 'bg-success'] as const;

export type PasswordInputVariantProps = VariantProps<typeof passwordInputVariants>;
