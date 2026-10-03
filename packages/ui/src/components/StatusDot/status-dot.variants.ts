import { tv, type VariantProps } from '../../utils/tv';

export const statusDotVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-2 align-middle',
    dot: 'relative inline-flex shrink-0 rounded-full',
    ping: 'absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden motion-reduce:animate-none',
    label: 'text-[12.5px] leading-5 font-medium text-foreground',
  },
  variants: {
    tone: {
      success: { dot: 'bg-success', ping: 'bg-success' },
      warning: { dot: 'bg-warning', ping: 'bg-warning' },
      destructive: { dot: 'bg-destructive', ping: 'bg-destructive' },
      info: { dot: 'bg-info', ping: 'bg-info' },
      neutral: { dot: 'bg-muted-foreground', ping: 'bg-muted-foreground' },
      primary: { dot: 'bg-primary', ping: 'bg-primary' },
    },
    size: {
      sm: { dot: 'size-1.5', label: 'text-[12px]' },
      md: { dot: 'size-2' },
      lg: { dot: 'size-2.5', label: 'text-[13px]' },
    },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
});

export type StatusDotVariantProps = VariantProps<typeof statusDotVariants>;
export type StatusDotTone = NonNullable<StatusDotVariantProps['tone']>;
