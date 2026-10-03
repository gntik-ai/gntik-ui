import { tv, type VariantProps } from '../../utils/tv';

export const keyValueEditorVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-3',
    header: 'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-end gap-2 px-0.5 font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase',
    headerSpacer: 'w-[4.25rem]',
    list: 'flex flex-col gap-2',
    row: 'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-start gap-2',
    cell: 'flex min-w-0 flex-col gap-1',
    keyInput: 'font-mono',
    valueInput: 'font-mono',
    rowActions: 'flex shrink-0 items-center gap-0.5 pt-0.5',
    error: 'text-[12px] leading-4 text-destructive-text',
    empty: 'rounded-md border border-dashed border-border px-3 py-4 text-center text-[12.5px] text-muted-foreground',
    footer: 'flex flex-wrap items-center gap-2',
    footerEnd: 'ms-auto flex items-center gap-2',
    paste: 'flex flex-col gap-2 rounded-lg border border-border bg-card p-3',
    pasteLabel: 'text-[12.5px] font-medium text-foreground',
    pasteHint: 'text-[12px] leading-4 text-muted-foreground',
    pasteActions: 'flex justify-end gap-2',
    status: 'sr-only',
  },
  variants: {
    size: {
      auto: { keyInput: 'text-[12.5px]', valueInput: 'text-[12.5px]' },
      sm: { keyInput: 'text-[12px]', valueInput: 'text-[12px]', rowActions: 'pt-0' },
      md: { keyInput: 'text-[12.5px]', valueInput: 'text-[12.5px]' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type KeyValueEditorVariantProps = VariantProps<typeof keyValueEditorVariants>;
