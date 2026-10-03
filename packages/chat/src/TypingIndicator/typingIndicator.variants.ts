/** Slot classes for TypingIndicator. Dots pulse in sequence; static under reduced motion. */
export const typingIndicatorStyles = {
  root: 'inline-flex items-center gap-2 text-muted-foreground',
  dots: 'inline-flex h-6 items-center gap-1',
  dot: 'size-1.5 rounded-full bg-muted-foreground animate-pulse motion-reduce:animate-none',
  label: 'text-[12.5px]',
  size: {
    sm: { dots: 'h-4 gap-0.5', dot: 'size-1' },
    md: { dots: '', dot: '' },
  },
} as const;

/** Thin blinking caret after streamed plain text (static under reduced motion). */
export const streamingCaret =
  'ms-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-primary animate-pulse motion-reduce:animate-none';
