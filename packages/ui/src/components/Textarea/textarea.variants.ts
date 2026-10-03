import { tv, type VariantProps } from '../../utils/tv';

export const textareaVariants = tv({
  base: [
    'block w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm',
    'placeholder:text-muted-foreground transition-colors motion-reduce:transition-none',
    'focus-visible:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    'data-invalid:border-destructive/70 aria-invalid:border-destructive/70',
    'disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground',
    'read-only:bg-secondary/40',
  ],
  variants: {
    size: {
      sm: 'text-[12px] leading-5',
      md: 'text-[13px] leading-6',
    },
    resize: {
      none: 'resize-none',
      vertical: 'resize-y',
    },
    autosize: {
      true: 'field-sizing-content min-h-[88px] resize-none',
      false: '',
    },
  },
  defaultVariants: { size: 'md', resize: 'none', autosize: false },
});

export type TextareaVariantProps = VariantProps<typeof textareaVariants>;
