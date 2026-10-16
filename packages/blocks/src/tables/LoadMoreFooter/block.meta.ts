import type { BlockMeta } from '../../meta';
import type { LoadMoreFooterLabels } from './LoadMoreFooter';

export const meta: BlockMeta = {
  name: 'Load more footer',
  family: 'tables',
  status: 'beta',
  description:
    'A load more button and loaded-count summary for appended lists without a total or page count. Cursor mode uses nextCursor and optional hasMore; flag mode omits nextCursor and uses hasMore. Compose with DataTable paginated={false} or Collapsible and JsonViewer cards. The consumer owns rows, filters and cursor normalization. Each attempt must settle loading=false together with its result in one update; split settles are unsupported. Keep cursor, hasMore, counts and lastAppend unchanged on failure. Cursor failures replace the button with ErrorPanel; flag failures keep the same button. Exhaustion removes every control even on failure. Focus moves only when the focused control is removed, to its replacement or exhaustedFocusTarget (summary by default, root optionally). lastAppend uses increasing seq values for successful appends, never initial loads, replacements or failures. New appended counts are announced politely; settled errors assertively. Self-wraps in LiveAnnouncer when needed. Every label has translated defaults and per-key overrides.',
  labels: [
    { key: 'loadMore', type: 'string', state: 'Available and idle: button name' },
    { key: 'loading', type: 'string', state: 'Loading: button name; ErrorPanel uses its own translated busy text' },
    { key: 'retry', type: 'string', state: 'Failed and available: retry button name' },
    { key: 'group', type: 'string', state: 'Always: root group accessible name' },
    { key: 'moreAvailable', type: 'string', state: 'Available: visible summary note' },
    {
      key: 'summary',
      type: '(count: number) => string',
      state: 'Always: loaded-count summary and default exhaustion focus target',
    },
    {
      key: 'loadedAnnouncement',
      type: '(count: number) => string',
      state: 'New lastAppend.seq with positive count: polite announcement',
    },
  ] satisfies Array<{ key: keyof LoadMoreFooterLabels; type: string; state: string }>,
  uses: ['Button', 'ErrorPanel', 'LiveAnnouncer'],
};
