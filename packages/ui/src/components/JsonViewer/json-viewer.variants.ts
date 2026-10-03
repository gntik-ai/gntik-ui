import { tv, type VariantProps } from '../../utils/tv';

/** Value colours: contrast-safe text tokens only (same mapping as CodeBlock's JSON tokens). */
export const jsonTypeClass = {
  key: 'text-primary-text',
  string: 'text-warning-text',
  number: 'text-destructive-text',
  boolean: 'font-semibold text-foreground',
  null: 'italic text-muted-foreground',
  summary: 'text-muted-foreground',
  punctuation: 'text-muted-foreground',
} as const;

export const jsonViewerVariants = tv({
  slots: {
    root: 'overflow-hidden rounded-md border border-border bg-card text-start',
    toolbar: 'flex min-h-10 items-center gap-2 border-b border-border bg-secondary/40 ps-3 pe-1.5',
    path: 'min-w-0 flex-1 truncate font-mono text-[11.5px] text-muted-foreground',
    pathValue: 'text-foreground',
    action: [
      'inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 font-mono text-[11px] text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    body: 'overflow-auto p-1.5 font-mono text-[12.5px]',
    row: 'min-w-0 truncate whitespace-pre',
    mark: 'rounded-[3px] bg-warning/16 text-warning-chip-text',
    empty: 'px-3 py-6 text-center font-sans text-[12.5px] text-muted-foreground',
  },
});

export type JsonViewerVariantProps = VariantProps<typeof jsonViewerVariants>;
