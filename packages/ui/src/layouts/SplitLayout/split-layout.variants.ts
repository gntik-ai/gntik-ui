import { tv, type VariantProps } from '../../utils/tv';

export const splitLayoutVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 overflow-hidden bg-background text-foreground',
    group: 'h-full',
    pane: 'flex h-full min-h-0 min-w-0 flex-col focus:outline-none',
    list: 'bg-card',
    detail: 'bg-background',
    paneHeader: 'flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-3',
    back: 'lg:hidden',
    paneBody: 'min-h-0 flex-1 overflow-y-auto',
    handle: 'max-lg:hidden',
  },
  variants: {
    fullScreen: { true: { root: 'h-dvh' }, false: { root: 'h-full min-h-0' } },
    showDetail: {
      true: { list: 'max-lg:hidden' },
      false: { detail: 'max-lg:hidden' },
    },
  },
  defaultVariants: { fullScreen: false, showDetail: false },
});

export type SplitLayoutVariantProps = VariantProps<typeof splitLayoutVariants>;
