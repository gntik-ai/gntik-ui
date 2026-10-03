import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'SuggestionChips',
  group: 'Actions',
  status: 'beta',
  description:
    'Prompt suggestions: a two-column grid of cards with descriptions for an empty conversation, or a row of pills for follow-ups after a reply. Choosing one calls onSelect with its prompt.',
  pattern: 'button group',
  keyboard: [
    ['Tab', 'Moves between suggestions'],
    ['Enter', 'Sends the focused suggestion'],
    ['Space', 'Sends the focused suggestion'],
  ],
  tokens: ['card', 'border', 'primary', 'primary-text', 'secondary', 'muted-foreground', 'focus-ring'],
};
