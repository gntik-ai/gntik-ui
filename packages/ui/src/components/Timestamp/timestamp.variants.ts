import { tv, type VariantProps } from '../../utils/tv';

export const timestampVariants = tv({
  base: [
    'rounded-sm whitespace-nowrap tabular-nums',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  ],
  variants: {
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
    },
    interactive: {
      true: 'cursor-default underline decoration-border decoration-dotted underline-offset-4',
      false: '',
    },
  },
  defaultVariants: { tone: 'muted', interactive: false },
});

export type TimestampVariantProps = VariantProps<typeof timestampVariants>;
