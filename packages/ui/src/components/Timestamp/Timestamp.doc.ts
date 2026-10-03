import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Timestamp',
  group: 'Display',
  status: 'beta',
  description: 'A date in a <time dateTime> element: relative ("3 minutes ago", Intl.RelativeTimeFormat) or absolute (Intl.DateTimeFormat), localised with `locale`. Accepts a Date, ISO string or epoch ms. Relative labels refresh on an adaptive interval that is cleared on unmount. The full date shows in a tooltip on hover or focus and is also part of the accessible text.',
  primitive: '@base-ui/react/tooltip',
  pattern: 'tooltip',
  keyboard: [
    ['Tab', 'Focuses the timestamp and shows the full date in a tooltip'],
    ['Escape', 'Hides the tooltip'],
  ],
  tokens: ['foreground', 'muted-foreground', 'border', 'focus-ring'],
};
