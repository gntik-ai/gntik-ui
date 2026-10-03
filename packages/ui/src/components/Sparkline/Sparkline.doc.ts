import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Sparkline',
  group: 'Display',
  status: 'beta',
  description: 'Inline trend in pure SVG (no chart library): line or bars, optional area fill and min / max / last markers, fixed width and height. Coloured with token classes (stroke-primary, fill-primary/14…) so it follows the theme, and exposed as role="img" with a generated summary ("Requests: trending up 12% from 140 to 157…").',
  pattern: 'img',
  tokens: ['primary', 'success', 'warning', 'destructive', 'info', 'muted-foreground', 'card'],
};
