import type { CursorPaginationProps } from '@gntik-ai/ui';

export const CURSOR_PAGER_PREVIEW = {
  hasPrevious: false,
  hasNext: true,
  onPrevious: () => {},
  onNext: () => {},
  shownCount: 25,
  labels: {
    shownSummary: (shownCount: number) => `${shownCount} records shown`,
    totalSummary: (total: number) => `${total} records in total`,
  },
} satisfies CursorPaginationProps;
