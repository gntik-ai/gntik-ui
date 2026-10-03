import { tv, type VariantProps } from '../../utils/tv';

export const sparklineVariants = tv({
  slots: {
    root: 'inline-block shrink-0 overflow-visible align-middle',
    line: 'fill-none',
    area: '',
    bar: '',
    marker: 'stroke-card',
    extreme: 'fill-card',
  },
  variants: {
    tone: {
      primary: { line: 'stroke-primary', area: 'fill-primary/14', bar: 'fill-primary', marker: 'fill-primary', extreme: 'stroke-primary' },
      success: { line: 'stroke-success', area: 'fill-success/14', bar: 'fill-success', marker: 'fill-success', extreme: 'stroke-success' },
      warning: { line: 'stroke-warning', area: 'fill-warning/14', bar: 'fill-warning', marker: 'fill-warning', extreme: 'stroke-warning' },
      destructive: { line: 'stroke-destructive', area: 'fill-destructive/14', bar: 'fill-destructive', marker: 'fill-destructive', extreme: 'stroke-destructive' },
      info: { line: 'stroke-info', area: 'fill-info/14', bar: 'fill-info', marker: 'fill-info', extreme: 'stroke-info' },
      neutral: { line: 'stroke-muted-foreground', area: 'fill-muted-foreground/14', bar: 'fill-muted-foreground', marker: 'fill-muted-foreground', extreme: 'stroke-muted-foreground' },
    },
  },
  defaultVariants: { tone: 'primary' },
});

export type SparklineVariantProps = VariantProps<typeof sparklineVariants>;
export type SparklineTone = NonNullable<SparklineVariantProps['tone']>;
