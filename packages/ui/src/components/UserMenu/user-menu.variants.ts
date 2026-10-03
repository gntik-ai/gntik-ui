import { tv, type VariantProps } from '../../utils/tv';

export const userMenuVariants = tv({
  slots: {
    trigger: [
      'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg transition-colors outline-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-popup-open:ring-2 data-popup-open:ring-ring/40',
    ],
    triggerName: 'pr-1 text-[13px] font-semibold text-foreground',
    popup: 'w-60',
    header: 'flex items-center gap-2.5 px-2.5 py-2',
    headerText: 'min-w-0',
    name: 'truncate text-[13px] font-semibold text-foreground',
    email: 'truncate font-mono text-[10.5px] text-muted-foreground',
  },
  variants: {
    showName: {
      true: { trigger: 'h-9 pr-2 pl-0.5 hover:bg-secondary/60' },
    },
  },
});

export type UserMenuVariantProps = VariantProps<typeof userMenuVariants>;
