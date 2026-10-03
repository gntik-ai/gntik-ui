import { tv, type VariantProps } from '../../utils/tv';

export const wizardLayoutVariants = tv({
  slots: {
    root: 'relative flex flex-col overflow-hidden bg-background font-sans text-foreground',
    skipLink: 'focus:absolute',
    header: 'shrink-0 border-b border-border bg-background',
    headerRow: 'flex h-12 items-center gap-3 px-4 sm:px-6',
    title: 'min-w-0 flex-1 truncate text-[13.5px] font-semibold tracking-tight',
    steps: 'mx-auto w-full px-4 pt-1 pb-4 sm:px-6',
    stepsFull: 'hidden lg:block',
    stepsCompact: 'lg:hidden',
    main: 'min-h-0 flex-1 overflow-y-auto outline-none',
    body: 'mx-auto w-full px-4 py-8 sm:px-6',
    footer: 'shrink-0 border-t border-border bg-card',
    footerRow: 'mx-auto flex w-full items-center gap-2 px-4 py-3 sm:px-6',
    footerAside: 'me-auto min-w-0 truncate text-[12.5px] text-muted-foreground',
  },
  variants: {
    width: {
      narrow: { steps: 'max-w-2xl', body: 'max-w-2xl', footerRow: 'max-w-2xl' },
      default: { steps: 'max-w-3xl', body: 'max-w-3xl', footerRow: 'max-w-3xl' },
      wide: { steps: 'max-w-5xl', body: 'max-w-5xl', footerRow: 'max-w-5xl' },
    },
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
  },
  defaultVariants: { width: 'default', fullScreen: false },
});

export type WizardLayoutVariantProps = VariantProps<typeof wizardLayoutVariants>;
