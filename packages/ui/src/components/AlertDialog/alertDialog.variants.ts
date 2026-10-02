import { tv, type VariantProps } from '../../utils/tv';

/**
 * Alert dialog styles. The shell (backdrop, viewport, popup) reuses `dialogVariants`;
 * these slots cover the confirmation layout: tone icon, text column and actions.
 */
export const alertDialogVariants = tv({
  slots: {
    popup: 'p-5',
    header: 'flex gap-3.5',
    icon: 'grid size-10 shrink-0 place-items-center rounded-lg',
    text: 'min-w-0 flex-1 pt-0.5',
    title: 'text-[15px] font-semibold tracking-tight text-foreground',
    description: 'mt-1.5 text-[13px] leading-6 text-muted-foreground text-pretty',
    footer: 'mt-5 flex flex-wrap justify-end gap-2.5',
  },
  variants: {
    tone: {
      destructive: { icon: 'bg-destructive/12 text-destructive-text' },
      warning: { icon: 'bg-warning/12 text-warning-text' },
      info: { icon: 'bg-info/12 text-info' },
    },
  },
  defaultVariants: { tone: 'destructive' },
});

export type AlertDialogVariantProps = VariantProps<typeof alertDialogVariants>;
