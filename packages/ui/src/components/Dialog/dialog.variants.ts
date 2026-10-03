import { tv, type VariantProps } from '../../utils/tv';

export const dialogVariants = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-50 bg-background/75 backdrop-blur-[3px] transition-opacity duration-200',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
    ],
    viewport: 'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-5 sm:p-8',
    popup: [
      'relative mt-[8vh] w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none',
      'transition-[opacity,translate,scale] duration-200 motion-reduce:transition-none',
      'data-starting-style:translate-y-2 data-starting-style:scale-[0.97] data-starting-style:opacity-0',
      'data-ending-style:translate-y-2 data-ending-style:scale-[0.97] data-ending-style:opacity-0',
    ],
    close: [
      'absolute top-3.5 right-3.5 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors',
      'hover:bg-secondary/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    header: 'flex flex-col gap-1 border-b border-border px-5 py-4 pr-14',
    title: 'text-[15px] font-semibold tracking-tight text-foreground',
    description: 'text-[12.5px] leading-5 text-muted-foreground text-pretty',
    body: 'px-5 py-4',
    footer: 'flex justify-end gap-2.5 border-t border-border px-5 py-3.5',
  },
  variants: {
    size: {
      sm: { popup: 'max-w-[380px]' },
      md: { popup: 'max-w-[460px]' },
      lg: { popup: 'max-w-[560px]' },
      xl: { popup: 'max-w-[720px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type DialogVariantProps = VariantProps<typeof dialogVariants>;
