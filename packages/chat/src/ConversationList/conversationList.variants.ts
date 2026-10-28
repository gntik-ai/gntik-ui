import { focusRing } from '../utils/focus';

export const conversationListStyles = {
  root: 'flex h-full min-h-0 flex-col gap-2 text-foreground',
  nav: 'min-h-0 flex-1 overflow-y-auto overscroll-contain p-2',
  heading: `flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-xs font-medium text-muted-foreground ${focusRing}`,
  row: `flex w-full min-w-0 items-start gap-3 rounded-lg px-3 py-2.5 text-start text-[13px] hover:bg-accent/55 aria-[current=true]:bg-accent disabled:opacity-50 aria-disabled:opacity-50 forced-colors:aria-[current=true]:bg-[Highlight] forced-colors:aria-[current=true]:text-[HighlightText] forced-colors:aria-[current=true]:[&_*]:text-[HighlightText] ${focusRing}`,
  title: 'min-w-0 flex-1 truncate text-foreground',
} as const;
