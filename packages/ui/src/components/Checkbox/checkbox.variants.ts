import { tv, type VariantProps } from '../../utils/tv';

export const checkboxVariants = tv({
  slots: {
    root: [
      'inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-border bg-background text-primary-foreground',
      'transition-colors motion-reduce:transition-none hover:border-muted-foreground/50',
      'data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary',
      'data-invalid:border-destructive/70',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    indicator: 'flex items-center justify-center data-unchecked:hidden',
    item: 'grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-0.5',
    label: 'col-span-2 grid cursor-pointer grid-cols-subgrid items-start has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-70',
    labelText: 'text-[13px] leading-5 font-medium text-foreground select-none',
    description: 'col-start-2 text-[12.5px] leading-5 text-muted-foreground text-pretty',
    group: 'flex flex-col',
  },
  variants: {
    variant: {
      plain: { group: 'gap-2.5' },
      list: { group: 'divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40 *:px-4 *:py-3.5' },
    },
  },
  defaultVariants: { variant: 'plain' },
});

export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>;
