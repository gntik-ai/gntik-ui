import { tv, type VariantProps } from '../../utils/tv';
import type { TokenKind } from './tokenize';

export const codeBlockVariants = tv({
  slots: {
    root: 'overflow-hidden rounded-md border border-border bg-card text-left',
    header: 'flex h-9 items-center justify-between gap-2 border-b border-border/70 pr-1.5 pl-3',
    heading: 'flex min-w-0 items-center gap-2',
    filename: 'truncate font-mono text-[11.5px] text-foreground',
    language: 'shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground uppercase',
    actions: 'flex shrink-0 items-center gap-0.5',
    button: [
      'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 font-mono text-[11px] text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary hover:text-foreground aria-pressed:bg-secondary aria-pressed:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    copied: 'text-primary-text hover:text-primary-text',
    pre: [
      'm-0 overflow-auto bg-background/40 py-3 font-mono text-[12.5px] leading-relaxed text-foreground',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    ],
    code: 'grid font-mono',
    line: 'flex border-l-2 border-transparent pr-4 pl-3.5 data-highlighted:border-primary data-highlighted:bg-primary/10',
    lineNumber: 'mr-4 inline-block shrink-0 text-right text-muted-foreground select-none',
    content: 'min-w-0 flex-1',
  },
  variants: {
    wrap: {
      true: { code: 'w-full', content: 'break-words whitespace-pre-wrap' },
      false: { code: 'w-max min-w-full', content: 'whitespace-pre' },
    },
  },
  defaultVariants: { wrap: false },
});

/** Token colours: only contrast-safe text tokens, so every theme keeps AA. */
export const tokenClass: Record<TokenKind, string> = {
  plain: '',
  keyword: 'text-primary-text',
  property: 'text-primary-text',
  string: 'text-warning-text',
  number: 'text-destructive-text',
  comment: 'text-muted-foreground italic',
  type: 'font-semibold text-foreground',
  function: 'font-medium text-foreground',
  punctuation: 'text-muted-foreground',
  muted: 'text-muted-foreground',
};

export const codeVariants = tv({
  base: 'rounded-[5px] border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground [overflow-wrap:anywhere]',
});

export type CodeBlockVariantProps = VariantProps<typeof codeBlockVariants>;
