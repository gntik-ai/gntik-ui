import { tv, type VariantProps } from '../../utils/tv';

/** The Input wrapper look, wrapping: chips first, then the free-text input. */
export const tokenInputVariants = tv({
  slots: {
    root: [
      'flex w-full min-w-0 cursor-text flex-wrap items-center gap-1.5 rounded-md border border-border bg-background text-foreground shadow-sm transition-colors motion-reduce:transition-none',
      'has-[input:focus-visible]:border-primary/60 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
      'data-invalid:border-destructive/70 has-[input[data-invalid]]:border-destructive/70',
      'data-disabled:cursor-not-allowed data-disabled:bg-secondary/50 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-secondary/50',
    ],
    list: 'contents',
    input: 'min-w-24 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
    counter: 'ml-auto shrink-0 pr-0.5 font-mono text-[11px] text-muted-foreground tabular-nums',
    chip: [
      'inline-flex max-w-full items-center gap-1 rounded border border-transparent bg-primary/14 pr-1 pl-2 font-medium text-primary-chip-text',
      'data-invalid:border-destructive/50 data-invalid:bg-destructive/12 data-invalid:text-destructive-chip-text',
      'data-disabled:opacity-60',
    ],
    chipText: 'truncate',
    chipRemove: [
      'grid size-4 shrink-0 place-items-center rounded transition-colors motion-reduce:transition-none hover:bg-primary/20',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'group-data-invalid/chip:hover:bg-destructive/20 disabled:pointer-events-none',
    ],
  },
  variants: {
    size: {
      sm: { root: 'min-h-8 px-1.5 py-1', input: 'h-6 px-1 text-[12px]', chip: 'h-5.5 text-[11.5px]' },
      md: { root: 'min-h-9 px-2 py-1.5', input: 'h-6 px-1 text-[13px]', chip: 'h-6 text-[12px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type TokenInputVariantProps = VariantProps<typeof tokenInputVariants>;
