import { tv, type VariantProps } from '../../utils/tv';

/**
 * The brand field (recessed wrapper that owns border and focus outline) holding spinbutton
 * segments. The focused segment gets a primary tint; empty segments show a muted placeholder.
 */
export const timePickerVariants = tv({
  slots: {
    root: [
      'flex w-full min-w-0 items-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors motion-reduce:transition-none',
      'focus-within:border-primary/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
      'data-invalid:border-destructive/70',
      'data-disabled:cursor-not-allowed data-disabled:bg-secondary/50 data-disabled:text-muted-foreground',
    ],
    icon: 'pointer-events-none shrink-0 text-muted-foreground',
    segments: 'flex min-w-0 items-center tabular-nums',
    segment: [
      'rounded-[4px] px-0.5 text-center outline-none select-none caret-transparent',
      'focus:bg-primary/14 focus:text-primary-chip-text',
      'data-placeholder:text-muted-foreground aria-disabled:cursor-not-allowed',
    ],
    separator: 'px-px text-muted-foreground select-none',
  },
  variants: {
    size: {
      /** Follows `data-density` (comfortable = md). */
      auto: { root: 'h-control gap-tight px-field text-[13px]' },
      sm: { root: 'h-8 gap-2 px-2.5 text-[12px]' },
      md: { root: 'h-9 gap-2.5 px-3 text-[13px]' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type TimePickerVariantProps = VariantProps<typeof timePickerVariants>;
