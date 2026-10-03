import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ChatMessage',
  group: 'Display',
  status: 'beta',
  description:
    'One conversation turn for the roles user (end-aligned bubble), participant (another person, e.g. a teammate: start-aligned outlined bubble with their name and avatar via `author` / `avatarSrc`), assistant, system and tool: avatar, author, timestamp, body and hover/focus actions (copy, retry, thumbs feedback). While streaming it is aria-busy, hides its actions and shows typing dots until text arrives; ChatAnnouncer announces start and end once instead of every token.',
  pattern: 'article',
  keyboard: [
    ['Tab', 'Reaches each action in order (copy, retry, good, bad); focusing one reveals the action group'],
    ['Enter', 'Activates the focused action'],
    ['Space', 'Activates the focused action; thumbs toggle (aria-pressed)'],
  ],
  tokens: ['foreground', 'muted-foreground', 'secondary', 'card', 'border', 'primary', 'primary-text', 'destructive-text', 'focus-ring'],
};
