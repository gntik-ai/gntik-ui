import { tv, type VariantProps } from '../../utils/tv';

/**
 * Number field in the Input look: one recessed wrapper (border + focus outline) holding the
 * − stepper, the value, an optional unit and the + stepper, split by hairline dividers.
 */
export const numberInputVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-1.5',
    scrub: 'inline-flex w-fit cursor-ew-resize text-[12px] font-medium text-muted-foreground select-none hover:text-foreground',
    scrubCursor: 'text-foreground drop-shadow-sm',
    group: [
      'flex w-full min-w-0 items-stretch overflow-hidden rounded-md border border-border bg-background text-foreground shadow-sm transition-colors motion-reduce:transition-none',
      'has-[input:focus-visible]:border-primary/60 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
      'data-invalid:border-destructive/70',
      'data-disabled:cursor-not-allowed data-disabled:bg-secondary/50 data-disabled:text-muted-foreground',
      'data-readonly:bg-secondary/40',
    ],
    input: [
      'h-full w-full min-w-0 bg-transparent text-foreground tabular-nums outline-none placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:text-muted-foreground read-only:text-muted-foreground',
    ],
    unit: 'flex shrink-0 items-center text-muted-foreground select-none',
    stepper: [
      'grid shrink-0 place-items-center border-border text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary/70 hover:text-foreground active:bg-secondary',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
      'disabled:cursor-not-allowed disabled:text-muted-foreground/40 disabled:hover:bg-transparent',
    ],
    decrement: 'border-e',
    increment: 'border-s',
  },
  variants: {
    size: {
      sm: { group: 'h-8 text-[12px]', input: 'px-2.5 text-[12px]', unit: 'pe-2.5 text-[12px]', stepper: 'w-8' },
      md: { group: 'h-9 text-[13px]', input: 'px-3 text-[13px]', unit: 'pe-3 text-[12.5px]', stepper: 'w-9' },
    },
    align: {
      start: { input: 'text-start' },
      center: { input: 'text-center' },
      end: { input: 'text-end' },
    },
  },
  defaultVariants: { size: 'md', align: 'start' },
});

export type NumberInputVariantProps = VariantProps<typeof numberInputVariants>;

/** Stepper icon size (px) per size. */
export const NUMBER_INPUT_ICON_SIZE = { sm: 13, md: 14 } as const;
