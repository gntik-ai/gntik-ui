import { tv, type VariantProps } from '../../utils/tv';

/**
 * The trigger is a read-only input styled as the brand field (calendar icon and chevron are
 * overlays inside its padding), so the whole field is the popover anchor.
 */
export const datePickerVariants = tv({
  slots: {
    root: 'relative flex w-full min-w-0 items-center',
    input: [
      'w-full min-w-0 cursor-pointer truncate rounded-md border border-border bg-background text-left text-foreground caret-transparent shadow-sm outline-none',
      'transition-colors motion-reduce:transition-none placeholder:text-muted-foreground hover:border-muted-foreground/40',
      'focus-visible:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-popup-open:border-primary/60 data-invalid:border-destructive/70 aria-invalid:border-destructive/70',
      'disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground disabled:hover:border-border',
    ],
    icon: 'pointer-events-none absolute shrink-0 text-muted-foreground',
    chevron: 'pointer-events-none absolute shrink-0 text-muted-foreground',
    panel: 'flex flex-col sm:flex-row',
    presets: 'flex shrink-0 flex-row flex-wrap gap-1 border-b border-border p-2 sm:w-36 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0',
    preset: [
      'rounded-[6px] px-2.5 py-1.5 text-left text-[12.5px] text-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'aria-pressed:bg-primary/12 aria-pressed:font-medium aria-pressed:text-primary-chip-text',
    ],
  },
  variants: {
    size: {
      sm: { input: 'h-8 pr-8 pl-8 text-[12px]', icon: 'left-2.5', chevron: 'right-2.5' },
      md: { input: 'h-9 pr-9 pl-9 text-[13px]', icon: 'left-3', chevron: 'right-3' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type DatePickerVariantProps = VariantProps<typeof datePickerVariants>;
