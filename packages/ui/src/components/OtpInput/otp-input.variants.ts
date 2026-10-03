import { tv, type VariantProps } from '../../utils/tv';

/** One recessed box per character, mono digits, primary border while focused, destructive when invalid. */
export const otpInputVariants = tv({
  slots: {
    root: 'group/otp flex w-fit items-center gap-2 data-disabled:cursor-not-allowed',
    slot: [
      'm-0 rounded-md border border-border bg-background p-0 text-center font-mono font-medium text-foreground shadow-sm caret-primary uppercase',
      'transition-colors motion-reduce:transition-none',
      'focus-visible:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus:outline-none',
      'data-filled:border-muted-foreground/40',
      'data-invalid:border-destructive/70 group-data-invalid/otp:border-destructive/70',
      'disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground',
      'read-only:bg-secondary/40',
    ],
    separator: 'h-px w-2.5 shrink-0 rounded-full bg-muted-foreground/50',
  },
  variants: {
    size: {
      sm: { slot: 'h-9 w-8 text-[14px]' },
      md: { slot: 'h-11 w-10 text-[17px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type OtpInputVariantProps = VariantProps<typeof otpInputVariants>;
