import { tv, type VariantProps } from '../../utils/tv';

export const settingsLayoutVariants = tv({
  slots: {
    root: 'relative flex flex-col overflow-hidden bg-background font-sans text-foreground lg:flex-row',
    skipLink: 'focus:absolute',
    sidebar: 'hidden w-60 shrink-0 flex-col gap-4 overflow-y-auto border-e border-border bg-background px-3 py-6 lg:flex',
    sidebarHeading: 'px-2.5 text-[13px] font-semibold tracking-tight text-foreground',
    compactNav: 'shrink-0 border-b border-border px-4 py-3 lg:hidden',
    main: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto outline-none',
    content: 'mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-6 sm:px-8 lg:py-8',
    header: 'flex flex-col gap-1 border-b border-border pb-5',
    title: 'text-[20px] font-semibold tracking-tight text-foreground',
    description: 'text-[13px] leading-relaxed text-muted-foreground',
    saveBar: [
      'sticky bottom-0 z-10 mt-auto border-t border-border bg-card/95 shadow-sm',
      'flex items-center justify-end gap-2 px-4 py-3 sm:px-8',
    ],
  },
  variants: {
    width: {
      narrow: { content: 'max-w-2xl' },
      default: { content: 'max-w-3xl' },
      wide: { content: 'max-w-5xl' },
    },
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
  },
  defaultVariants: { width: 'default', fullScreen: false },
});

export type SettingsLayoutVariantProps = VariantProps<typeof settingsLayoutVariants>;
