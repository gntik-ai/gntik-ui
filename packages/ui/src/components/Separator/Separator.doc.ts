import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Separator',
  group: 'Layout',
  status: 'stable',
  description: 'Thin rule between content. Horizontal or vertical, default / subtle / strong weight, and an optional label (plain text, mono kicker or pill) placed at the start, centre or end of a horizontal line.',
  primitive: '@base-ui/react/separator',
  pattern: 'separator',
  tokens: ['border', 'secondary', 'muted-foreground'],
};
