import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useVirtualWindow',
  status: 'stable',
  description:
    'Computes the window of rows to render for a scroll position. Import useVirtualWindow from @gntik-ai/ui/hooks. sizeOf(index) gives each row height in px; the result holds prefix offsets, the first and last row to render including overscan, and the total height. It is pure arithmetic over its inputs and keeps no scroll state; VirtualList is built on it.',
  signature: 'useVirtualWindow(count, sizeOf, scrollTop, viewportHeight, overscan): { offsets, start, end, total }',
  server:
    'Computes from its arguments only, so the server and the browser agree for the same inputs (`Rendered rows: 0 to 5 of 1000` in the example at scrollTop 0).',
};
