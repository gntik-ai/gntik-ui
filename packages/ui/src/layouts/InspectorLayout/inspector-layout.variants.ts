import { tv, type VariantProps } from '../../utils/tv';

export const inspectorLayoutVariants = tv({
  slots: {
    root: 'relative flex w-full min-w-0 overflow-hidden bg-background text-foreground',
    main: 'min-h-0 min-w-0 flex-1 overflow-y-auto',
    panel: 'flex h-full min-h-0 shrink-0 flex-col border-s border-border bg-card',
    panelHeader: 'flex h-12 shrink-0 items-center gap-1 border-b border-border/60 pe-2 ps-4',
    panelTitle: 'min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground',
    panelBody: 'min-h-0 flex-1 overflow-y-auto p-4',
    drawerBody: 'p-4',
  },
  variants: {
    fullScreen: { true: { root: 'h-dvh' }, false: { root: 'h-full min-h-0' } },
    pinned: {
      true: { panel: '' },
      false: { panel: 'absolute inset-y-0 end-0 z-20 shadow-md' },
    },
  },
  defaultVariants: { fullScreen: false, pinned: true },
});

export type InspectorLayoutVariantProps = VariantProps<typeof inspectorLayoutVariants>;
