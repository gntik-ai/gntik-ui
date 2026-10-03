import { tv, type VariantProps } from '../../utils/tv';

/**
 * Inline banner. Info has no contrast-safe text alias, so its title stays `text-foreground`
 * and only the icon carries the tone.
 */
export const alertVariants = tv({
  slots: {
    root: 'flex gap-3 rounded-lg border p-4',
    icon: 'mt-px shrink-0',
    content: 'min-w-0 flex-1',
    title: 'text-[13.5px] font-semibold tracking-tight',
    description: 'text-[13px] leading-6 text-foreground/80',
    actions: 'mt-3 flex flex-wrap items-center gap-x-5 gap-y-2',
    dismiss: [
      '-mt-0.5 -me-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md transition-colors motion-reduce:transition-none hover:bg-foreground/10',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    tone: {
      info: { root: 'border-info/25 bg-info/10', icon: 'text-info', title: 'text-foreground', dismiss: 'text-muted-foreground hover:text-foreground' },
      success: { root: 'border-success/25 bg-success/10', icon: 'text-success-text', title: 'text-success-text', dismiss: 'text-success-text' },
      warning: { root: 'border-warning/30 bg-warning/10', icon: 'text-warning-text', title: 'text-warning-text', dismiss: 'text-warning-text' },
      destructive: { root: 'border-destructive/30 bg-destructive/10', icon: 'text-destructive-text', title: 'text-destructive-text', dismiss: 'text-destructive-text' },
    },
  },
  defaultVariants: { tone: 'info' },
});

export type AlertVariantProps = VariantProps<typeof alertVariants>;
export type AlertTone = NonNullable<AlertVariantProps['tone']>;
