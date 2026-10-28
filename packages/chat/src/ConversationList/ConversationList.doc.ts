import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ConversationList',
  group: 'Navigation',
  status: 'beta',
  description:
    'Presentational conversation history with local-calendar recency groups, disclosures, inline rename, sibling row menus, unread counts, New chat and incremental loading. Supply items and handlers; persistence and shortcuts belong to the app. getHref opts into links. groupBy=false preserves input order; a function groups by its returned key. Controlled activeId/collapsedGroups and their default counterparts are supported. Recency collapse keys are today, yesterday, previous7Days and older; custom groups use their returned key. Supply now for stable SSR. Above virtualizeAt (100), measured rows are windowed with the tab stop retained; give the list a bounded height. Uses a roving list of buttons/links, not a listbox: unlike NavList, individual rows are not separate Tab stops. New chat and Load more are separate stops outside the nav. loadingMore keeps Load more focusable but aria-disabled and busy.',
  primitive: 'MoreMenu · Input · Badge · Kbd · useVirtualWindow',
  pattern: 'navigation with disclosures and roving focus',
  keyboard: [
    [
      'Tab / Shift+Tab',
      'Enter the nav on the active row, else the first enabled row; the next Tab leaves it, including after using sibling row actions',
    ],
    ['ArrowDown / ArrowUp', 'Move through headings and enabled rows in visual order; skip collapsed rows'],
    ['Home / End', 'Move to the first / last heading or enabled row'],
    ['Enter / Space', 'Activate an enabled row once, or toggle a group heading'],
    ['ArrowRight (ArrowLeft in RTL)', 'From a row, focus its sibling More actions trigger'],
    [
      'ArrowLeft (ArrowRight in RTL) / Escape',
      'From the actions trigger, return to the row; Escape in a menu closes it',
    ],
    ['F2', 'Start rename when onRename is provided; the title is selected'],
    ['Enter in rename', 'Save a trimmed, nonempty changed title and return focus to the row'],
    ['Escape in rename', 'Cancel editing and return focus to the row'],
  ],
  tokens: ['foreground', 'muted-foreground', 'accent', 'border', 'primary', 'focus-ring'],
};
