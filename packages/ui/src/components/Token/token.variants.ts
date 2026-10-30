import { tv, type VariantProps } from '../../utils/tv';

export const tokenVariants = tv({
  slots: {
    root: [
      'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-md border align-middle whitespace-nowrap select-none',
      'data-disabled:bg-secondary data-disabled:text-foreground border-tone/(--token-border-alpha) bg-tone/(--token-bg-alpha) text-tone-chip-text',
    ],
    leading: 'inline-flex shrink-0 items-center text-tone-text [&_svg]:shrink-0',
    label: 'min-w-0 truncate font-medium',
    remove: [
      'grid shrink-0 cursor-interactive place-items-center rounded text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'disabled:cursor-disabled disabled:hover:bg-transparent disabled:hover:text-muted-foreground',
    ],
  },
  variants: {
    tone: {
      neutral: { root: 'border-border bg-background', leading: 'text-muted-foreground' },
      primary: { root: '[--token-border-alpha:35%] [--token-bg-alpha:10%]' },
      success: { root: '[--token-border-alpha:35%] [--token-bg-alpha:10%]' },
      warning: { root: '[--token-border-alpha:40%] [--token-bg-alpha:12%]' },
      destructive: { root: '[--token-border-alpha:35%] [--token-bg-alpha:10%]' },
    },
    size: {
      /** Follows `data-density` (comfortable = md). */
      auto: { root: 'h-token ps-2.5 text-[12px]', remove: 'size-5', label: 'max-w-[160px]' },
      sm: { root: 'h-6 ps-2 text-[11.5px]', remove: 'size-4', label: 'max-w-[120px]' },
      md: { root: 'h-7 ps-2.5 text-[12px]', remove: 'size-5', label: 'max-w-[160px]' },
    },
    removable: {
      true: { root: 'pe-1' },
      false: {},
    },
  },
  compoundVariants: [
    { removable: false, size: 'auto', class: { root: 'pe-2.5' } },
    { removable: false, size: 'sm', class: { root: 'pe-2' } },
    { removable: false, size: 'md', class: { root: 'pe-2.5' } },
  ],
  defaultVariants: { tone: 'neutral', size: 'auto', removable: false },
});

export type TokenVariantProps = VariantProps<typeof tokenVariants>;
export type TokenTone = NonNullable<TokenVariantProps['tone']>;
