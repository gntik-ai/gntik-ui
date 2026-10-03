import { focusRing } from '../utils/focus';

/**
 * Blinking caret drawn after the last block while text streams in. Pure CSS (an ::after on the
 * last child), so it follows paragraphs, list items and code without extra DOM.
 */
export const streamingCaretClass = [
  "[&>:last-child]:after:ml-0.5 [&>:last-child]:after:inline-block [&>:last-child]:after:h-[1.05em] [&>:last-child]:after:w-[2px]",
  "[&>:last-child]:after:translate-y-[2px] [&>:last-child]:after:bg-primary [&>:last-child]:after:content-['']",
  '[&>:last-child]:after:animate-pulse motion-reduce:[&>:last-child]:after:animate-none',
].join(' ');

/** Element classes for Markdown (token colours only). */
export const markdownStyles = {
  root: 'min-w-0 text-[14px] leading-[1.7] text-foreground [overflow-wrap:anywhere] [&>:first-child]:mt-0 [&>:last-child]:mb-0',
  h1: 'mt-5 mb-2 text-[18px] font-semibold tracking-tight',
  h2: 'mt-5 mb-2 text-[16px] font-semibold tracking-tight',
  h3: 'mt-4 mb-1.5 text-[14.5px] font-semibold',
  h4: 'mt-4 mb-1.5 text-[13.5px] font-semibold text-muted-foreground',
  p: 'my-2.5',
  ul: 'my-2.5 list-disc space-y-1 pl-5 marker:text-muted-foreground',
  ol: 'my-2.5 list-decimal space-y-1 pl-5 marker:text-muted-foreground',
  li: 'pl-1 [&>ul]:my-1 [&>ol]:my-1 [&.task-list-item]:list-none [&.task-list-item]:-ml-5',
  blockquote: 'my-3 border-l-2 border-primary/50 pl-3.5 text-muted-foreground',
  hr: 'my-5 border-border',
  link: `rounded-sm font-medium text-primary-text underline decoration-primary/40 underline-offset-2 hover:decoration-primary ${focusRing}`,
  linkIcon: 'ml-0.5 inline-block align-[-1px]',
  inlineCode: 'rounded-md border border-border bg-secondary/60 px-1.5 py-px font-mono text-[12.5px]',
  tableWrap: 'my-3 overflow-x-auto rounded-lg border border-border',
  table: 'w-full border-collapse text-left text-[13px]',
  th: 'border-b border-border bg-secondary/50 px-3 py-2 font-semibold',
  td: 'border-b border-border px-3 py-2 align-top [tr:last-child_&]:border-b-0',
  checkbox: 'mr-1.5 align-[-2px] accent-primary',
  image: 'text-muted-foreground italic',
  code: {
    root: 'my-3 overflow-hidden rounded-lg border border-border bg-secondary/40',
    header: 'flex h-9 items-center justify-between border-b border-border bg-secondary/50 pl-3 pr-1.5',
    lang: 'font-mono text-[11px] tracking-wide text-muted-foreground uppercase',
    pre: 'overflow-x-auto p-3 font-mono text-[12.5px] leading-6',
  },
} as const;
