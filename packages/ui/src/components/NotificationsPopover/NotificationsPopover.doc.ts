import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'NotificationsPopover',
  group: 'Overlays',
  status: 'beta',
  description:
    'Bell icon button with an unread-count badge that opens a popover of notifications: title, body, relative time and a tone dot for unread items, a mark-all-read action, an optional footer (View all) and an empty state.',
  primitive: '@base-ui/react/popover',
  pattern: 'disclosure (non-modal dialog)',
  keyboard: [
    ['Enter / Space', 'On the bell: opens the panel and moves focus into it'],
    ['Tab', 'Moves through mark-all-read, the notification rows and the footer'],
    ['Enter / Space', 'On a row: runs onSelect'],
    ['Escape', 'Closes the panel and returns focus to the bell'],
  ],
  tokens: ['popover', 'border', 'destructive', 'destructive-foreground', 'chrome', 'primary', 'primary-text', 'info', 'warning', 'secondary', 'muted-foreground', 'focus-ring'],
};
