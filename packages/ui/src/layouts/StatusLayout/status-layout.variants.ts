import { tv, type VariantProps } from '../../utils/tv';

export const statusLayoutVariants = tv({
  slots: {
    root: 'relative flex flex-col overflow-hidden bg-background font-sans text-foreground',
    skipLink: 'focus:absolute',
    header: 'flex h-14 shrink-0 items-center gap-3 px-5 sm:px-8',
    main: 'flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center outline-none',
    content: 'flex w-full max-w-md flex-col items-center',
    illustration: 'mb-6 flex justify-center text-muted-foreground',
    iconHalo: 'grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground ring-1 ring-border',
    code: 'font-mono text-[12px] font-semibold tracking-[0.2em] uppercase',
    title: 'mt-3 text-[24px] font-semibold tracking-[-0.02em] text-balance text-foreground',
    description: 'mt-2 text-[14px] leading-relaxed text-pretty text-muted-foreground',
    actions: 'mt-7 flex flex-wrap items-center justify-center gap-2.5',
    extra: 'mt-6 w-full',
    footer: 'flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-4 text-[12.5px] text-muted-foreground',
  },
  variants: {
    tone: {
      neutral: { code: 'text-muted-foreground' },
      primary: { code: 'text-primary-text', iconHalo: 'bg-primary/14 text-primary-chip-text ring-primary/30' },
      warning: { code: 'text-warning-text', iconHalo: 'bg-warning/14 text-warning-chip-text ring-warning/30' },
      destructive: { code: 'text-destructive-text', iconHalo: 'bg-destructive/14 text-destructive-chip-text ring-destructive/30' },
    },
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
  },
  defaultVariants: { tone: 'neutral', fullScreen: false },
});

export type StatusLayoutVariantProps = VariantProps<typeof statusLayoutVariants>;
