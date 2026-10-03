import { tv, type VariantProps } from '../../utils/tv';

export const radioGroupVariants = tv({
  slots: {
    group: 'flex flex-col',
    radio: [
      'inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background',
      'transition-colors motion-reduce:transition-none hover:border-muted-foreground/50',
      'data-checked:border-primary data-checked:bg-primary data-invalid:border-destructive/70',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    indicator: 'size-1.5 rounded-full bg-primary-foreground data-unchecked:hidden',
    item: 'grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-0.5',
    label: 'col-span-2 grid cursor-pointer grid-cols-subgrid items-start has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-70',
    labelText: 'min-w-0 text-[13px] leading-5 font-medium text-foreground select-none',
    trailing: 'col-start-3 row-start-1 text-end text-[13px] leading-5 font-semibold text-foreground',
    description: 'col-start-2 col-end-4 text-[12.5px] leading-5 text-muted-foreground text-pretty',
  },
  variants: {
    variant: {
      plain: { group: 'gap-2.5' },
      list: {
        group: 'gap-0 divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40',
        item: 'px-4 py-3.5',
      },
      card: {
        group: 'gap-3',
        item: [
          'rounded-md border border-border bg-background px-4 py-3.5 transition-colors motion-reduce:transition-none',
          'hover:border-muted-foreground/40 has-[[data-checked]]:border-primary/60 has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-primary/20',
          'has-[[data-disabled]]:hover:border-border',
        ],
        labelText: 'font-semibold',
        description: 'text-[12px]',
      },
    },
  },
  defaultVariants: { variant: 'plain' },
});

export type RadioGroupVariantProps = VariantProps<typeof radioGroupVariants>;
