import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'OverflowList',
  group: 'Display',
  status: 'beta',
  description:
    'Row of chips or avatars that renders items up to `max` (or to the available width with `responsive`, measured by ResizeObserver) and a "+N more" button that opens a Popover listing the rest. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
  primitive: '@base-ui/react/popover',
  pattern: 'list + disclosure popover',
  keyboard: [
    ['Tab', 'Moves to the "+N more" button (and any interactive items)'],
    ['Enter / Space', 'On the "+N more" button: opens the popover with the hidden items'],
    ['Escape', 'Closes the popover and returns focus to the button'],
  ],
  dataAttributes: [['data-popup-open', 'trigger', 'The associated popup is open.']],
  tokens: ['card', 'border', 'secondary', 'muted-foreground', 'foreground', 'popover', 'focus-ring'],
};
