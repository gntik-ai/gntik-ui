import { tv, type VariantProps } from '../../utils/tv';

export const toastVariants = tv({
  slots: {
    viewport: [
      'fixed right-4 bottom-4 z-50 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col-reverse gap-2.5 outline-none',
      'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring',
    ],
    root: [
      'w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none',
      '[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(var(--toast-swipe-movement-y,0px))]',
      'transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none',
      'data-starting-style:translate-y-3 data-starting-style:scale-[0.97] data-starting-style:opacity-0',
      'data-ending-style:translate-y-3 data-ending-style:scale-[0.97] data-ending-style:opacity-0',
      'data-limited:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    content: 'flex gap-3 p-3.5',
    icon: 'mt-px grid size-7 shrink-0 place-items-center rounded-lg bg-foreground/5',
    text: 'min-w-0 flex-1',
    title: 'text-[13px] font-semibold tracking-tight text-foreground',
    description: 'mt-0.5 text-[12.5px] leading-5 text-muted-foreground text-pretty',
    action: [
      'mt-2 rounded-sm text-[12px] font-semibold transition-opacity hover:opacity-70',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    close: [
      '-mt-0.5 -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors',
      'hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    tone: {
      neutral: { icon: 'text-foreground', action: 'text-foreground' },
      success: { icon: 'text-success-text', action: 'text-success-text' },
      info: { icon: 'text-info', action: 'text-foreground' },
      warning: { icon: 'text-warning-text', action: 'text-warning-text' },
      destructive: { icon: 'text-destructive-text', action: 'text-destructive-text' },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export type ToastVariantProps = VariantProps<typeof toastVariants>;
export type ToastTone = NonNullable<ToastVariantProps['tone']>;
