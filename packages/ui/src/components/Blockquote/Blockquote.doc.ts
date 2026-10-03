import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Blockquote',
  group: 'Display',
  status: 'beta',
  description:
    'Quoted content with its citation: a figure with the blockquote and a figcaption whose cite names the source (linked when `cite` is a URL). Variants: an inline-start rule for prose, a card for testimonials, a centred pull quote.',
  pattern: 'figure + blockquote + figcaption/cite',
  keyboard: [['Tab', 'Moves to the source link when `cite` is set']],
  tokens: ['primary', 'primary-text', 'card', 'border', 'foreground', 'muted-foreground', 'focus-ring'],
};
