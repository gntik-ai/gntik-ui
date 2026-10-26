import { tv, type VariantProps } from '../../utils/tv';

export const timestampVariants = tv({
  base: ['rounded-sm whitespace-nowrap tabular-nums', 'focus-ring'],
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
