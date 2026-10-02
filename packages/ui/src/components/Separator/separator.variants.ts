import { tv, type VariantProps } from '../../utils/tv';

export const separatorVariants = tv({
  slots: {
    line: 'shrink-0 border-0',
    labelled: 'flex w-full items-center gap-3',
    label: 'shrink-0',
  },
  variants: {
    orientation: {
      horizontal: { line: 'h-px w-full' },
      vertical: { line: 'w-px self-stretch' },
    },
    variant: {
      default: { line: 'bg-border' },
      subtle: { line: 'bg-border/50' },
      strong: { line: 'rounded-full bg-border' },
    },
    labelStyle: {
      plain: { label: 'text-[12.5px] text-muted-foreground' },
      kicker: { label: 'font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase' },
      pill: { label: 'inline-flex h-[22px] items-center rounded-full bg-secondary px-2.5 font-mono text-[10.5px] font-semibold text-muted-foreground' },
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', variant: 'strong', class: { line: 'h-0.5' } },
    { orientation: 'vertical', variant: 'strong', class: { line: 'w-0.5' } },
  ],
  defaultVariants: { orientation: 'horizontal', variant: 'default', labelStyle: 'plain' },
});

export type SeparatorVariantProps = VariantProps<typeof separatorVariants>;
