/** Slot classes for ChatMessage, per role. */
export const chatMessageStyles = {
  root: 'group/message relative flex gap-3 outline-none',
  avatar: 'mt-0.5 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  meta: 'flex items-baseline gap-2 text-[12px] leading-5',
  author: 'font-semibold text-foreground',
  time: 'font-mono text-[11px] text-muted-foreground',
  content: 'min-w-0 text-[14px] leading-[1.7] text-foreground',
  actions: [
    'flex items-center gap-0.5 transition-opacity motion-reduce:transition-none',
    'opacity-0 group-hover/message:opacity-100 group-focus-within/message:opacity-100 [@media(hover:none)]:opacity-100',
  ].join(' '),
  actionsVisible: 'opacity-100',
  /** @deprecated The empty streaming state renders TypingIndicator (see typingIndicatorStyles). */
  typing: 'inline-flex h-6 items-center gap-1',
  /** @deprecated See typingIndicatorStyles.dot. */
  typingDot: 'size-1.5 rounded-full bg-muted-foreground animate-pulse motion-reduce:animate-none',
  role: {
    user: {
      root: 'flex-row-reverse',
      body: 'items-end',
      meta: 'flex-row-reverse',
      content: 'max-w-[85%] rounded-2xl rounded-se-md bg-secondary px-4 py-2.5 whitespace-pre-wrap [overflow-wrap:anywhere]',
    },
    assistant: { root: '', body: '', meta: '', content: '' },
    participant: {
      root: '',
      body: 'items-start',
      meta: '',
      content: 'max-w-[85%] rounded-2xl rounded-ss-md border border-border bg-card px-4 py-2.5 whitespace-pre-wrap [overflow-wrap:anywhere]',
    },
    system: {
      root: 'justify-center',
      body: 'items-center',
      meta: 'sr-only',
      content: 'rounded-full border border-border bg-card px-3 py-1 text-center text-[12px] leading-5 text-muted-foreground',
    },
    tool: { root: '', body: '', meta: '', content: 'text-[13px]' },
  },
} as const;
