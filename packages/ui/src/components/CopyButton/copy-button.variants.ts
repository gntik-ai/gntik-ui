import { tv, type VariantProps } from '../../utils/tv';

/** Status styling layered over the kit Button; the sr-only region carries the announcement. */
export const copyButtonVariants = tv({
  slots: {
    button: 'transition-colors motion-reduce:transition-none',
    status: 'sr-only',
  },
  variants: {
    state: {
      idle: {},
      copied: { button: 'text-primary-text hover:text-primary-text' },
      failed: { button: 'text-destructive-text hover:text-destructive-text' },
    },
  },
  defaultVariants: { state: 'idle' },
});

export type CopyButtonVariantProps = VariantProps<typeof copyButtonVariants>;
