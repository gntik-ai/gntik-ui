import { tv } from '../../utils/tv';

export const dropzoneVariants = tv({
  base: 'rounded-xl border-2 border-dashed border-border bg-background p-8 text-center text-foreground focus-ring transition-colors motion-reduce:transition-none',
  variants: {
    dragState: {
      idle: '',
      accept: 'border-primary bg-primary/10',
      reject: 'border-destructive bg-destructive/10 text-destructive-text',
    },
    disabled: { true: 'opacity-60' },
  },
});
