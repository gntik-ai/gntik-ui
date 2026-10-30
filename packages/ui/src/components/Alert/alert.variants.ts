import { tv, type VariantProps } from '../../utils/tv';

/**
 * Inline banner. Info has no contrast-safe text alias, so its title stays `text-foreground`
 * and only the icon carries the tone.
 */
export const alertVariants = tv({
  slots: {
    root: 'flex gap-3 rounded-lg border border-tone/(--alert-border-alpha) bg-tone/10 p-4',
    icon: 'mt-px shrink-0 text-tone-text',
    content: 'min-w-0 flex-1',
    title: 'text-[13.5px] font-semibold tracking-tight text-tone-text',
    description: 'text-[13px] leading-6 text-foreground/80',
    actions: 'mt-3 flex flex-wrap items-center gap-x-5 gap-y-2',
    dismiss: [
      '-mt-0.5 -me-1 grid size-6 shrink-0 cursor-interactive place-items-center rounded-md transition-colors motion-reduce:transition-none hover:bg-foreground/10',
      'focus-ring text-tone-text',
    ],
  },
  variants: {
    tone: {
      info: {
        root: '[--alert-border-alpha:25%]',
        icon: 'text-info',
        dismiss: 'text-muted-foreground hover:text-foreground',
      },
      success: { root: '[--alert-border-alpha:25%]' },
      warning: { root: '[--alert-border-alpha:30%]' },
      destructive: { root: '[--alert-border-alpha:30%]' },
    },
  },
  defaultVariants: { tone: 'info' },
});

export type AlertVariantProps = VariantProps<typeof alertVariants>;
export type AlertTone = NonNullable<AlertVariantProps['tone']>;
