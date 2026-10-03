import { tv, type VariantProps } from '../../utils/tv';

export const infoTipVariants = tv({
  slots: {
    trigger: [
      'inline-grid shrink-0 cursor-pointer place-items-center rounded-full align-middle text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:text-foreground data-popup-open:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    content: 'w-64',
    body: 'text-[12.5px] leading-5 text-muted-foreground text-pretty',
  },
  variants: {
    size: {
      sm: { trigger: 'size-4' },
      md: { trigger: 'size-5' },
    },
  },
  defaultVariants: { size: 'sm' },
});

export type InfoTipVariantProps = VariantProps<typeof infoTipVariants>;
