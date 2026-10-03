import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ToolCallCard',
  group: 'Display',
  status: 'beta',
  description:
    'A tool invocation in an assistant turn: name, status (running, succeeded, failed), duration and a collapsible body with the arguments and the result or error as small collapsible JSON views. Failed calls open by default.',
  primitive: '@base-ui/react/collapsible',
  pattern: 'disclosure',
  keyboard: [
    ['Enter', 'Expands or collapses the card (or a JSON section)'],
    ['Space', 'Expands or collapses the card (or a JSON section)'],
    ['Tab', 'Moves to the JSON sections and their scrollable code'],
  ],
  tokens: ['card', 'border', 'secondary', 'muted-foreground', 'success-text', 'destructive', 'destructive-text', 'focus-ring'],
};
