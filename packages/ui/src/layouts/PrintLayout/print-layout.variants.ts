import { tv, type VariantProps } from '../../utils/tv';

export const printLayoutVariants = tv({
  slots: {
    root: [
      'relative overflow-auto bg-secondary/40 px-4 py-8 font-sans text-foreground sm:px-8',
      'print:h-auto print:min-h-0 print:overflow-visible print:bg-transparent print:p-0',
    ],
    skipLink: 'focus:absolute print:hidden',
    main: 'outline-none',
    sheet: [
      'mx-auto flex flex-col border border-border bg-card text-card-foreground shadow-sm',
      'print:m-0 print:w-auto print:min-h-0 print:max-w-none print:border-0 print:shadow-none',
    ],
    header: 'flex items-start justify-between gap-6 border-b border-border pb-6',
    content: 'flex-1 py-8 text-[13px] leading-relaxed',
    footer: 'border-t border-border pt-4 text-[11px] text-muted-foreground',
    pageBreak: [
      'relative my-10 border-t border-dashed border-border',
      'break-after-page print:my-0 print:border-0',
    ],
    pageBreakLabel: 'absolute -top-2 left-1/2 -translate-x-1/2 bg-card px-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase print:hidden',
  },
  variants: {
    size: {
      a4: { sheet: 'w-[210mm] max-w-full min-h-[297mm]' },
      letter: { sheet: 'w-[8.5in] max-w-full min-h-[11in]' },
    },
    margin: {
      narrow: { sheet: 'p-[12mm] print:p-0' },
      normal: { sheet: 'p-[20mm] print:p-0' },
      wide: { sheet: 'p-[28mm] print:p-0' },
    },
    fullScreen: {
      true: { root: 'h-dvh' },
      false: { root: 'h-full min-h-full' },
    },
  },
  defaultVariants: { size: 'a4', margin: 'normal', fullScreen: false },
});

export type PrintLayoutVariantProps = VariantProps<typeof printLayoutVariants>;
