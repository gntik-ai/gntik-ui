import { tv, type VariantProps } from '../../utils/tv';

/**
 * The brand field: a recessed (bg-background) wrapper that owns the border and the focus
 * outline, so icons, addons and the bare input focus as one piece.
 */
export const inputVariants = tv({
  slots: {
    root: [
      'flex w-full min-w-0 items-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors motion-reduce:transition-none',
      'has-[input:focus-visible]:border-primary/60 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
      'data-invalid:border-destructive/70 has-[input[data-invalid]]:border-destructive/70 has-[input[aria-invalid=true]]:border-destructive/70',
      'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-secondary/50 has-[input:disabled]:text-muted-foreground',
      'has-[input:read-only]:bg-secondary/40',
    ],
    input: [
      'h-full w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground',
      'disabled:cursor-not-allowed disabled:text-muted-foreground read-only:text-muted-foreground',
    ],
    icon: 'pointer-events-none shrink-0 text-muted-foreground',
    addon: 'flex shrink-0 items-center text-muted-foreground select-none',
  },
  variants: {
    size: {
      /** Follows `data-density` (comfortable = md). */
      auto: { root: 'h-control gap-tight px-field text-[13px]', input: 'text-[13px]' },
      sm: { root: 'h-8 gap-2 px-2.5 text-[12px]', input: 'text-[12px]' },
      md: { root: 'h-9 gap-2.5 px-3 text-[13px]', input: 'text-[13px]' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type InputVariantProps = VariantProps<typeof inputVariants>;

/** Icon size (px) per input size. */
export const INPUT_ICON_SIZE = { auto: 15, sm: 14, md: 15 } as const;
