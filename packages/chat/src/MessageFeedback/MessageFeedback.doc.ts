import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'MessageFeedback',
  group: 'Actions',
  status: 'beta',
  description:
    'Actions for an assistant reply: copy, regenerate and thumbs up / down toggles (aria-pressed). Thumbs down opens a popover with a reason picker and an optional comment. Controlled with `value` + `onFeedback`; pressing the active thumb clears it. A polite status confirms the feedback.',
  primitive: 'Popover',
  pattern: 'toggle button + dialog',
  keyboard: [
    ['Tab', 'Moves through copy, regenerate, good and bad'],
    ['Enter / Space', 'Toggles the focused thumb (aria-pressed); a second press clears it'],
    ['Enter / Space (on bad)', 'Also opens the details popover; focus moves into it'],
    ['Arrow keys', 'Inside the popover: move between reasons'],
    ['Escape', 'Closes the popover (the rating stays) and returns focus to the thumb'],
  ],
  tokens: ['muted-foreground', 'primary-text', 'destructive-text', 'popover', 'border', 'focus-ring'],
};
