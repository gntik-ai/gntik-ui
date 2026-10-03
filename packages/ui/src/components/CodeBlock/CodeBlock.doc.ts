import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'CodeBlock',
  group: 'Display',
  status: 'beta',
  description: 'Read-only code panel with a filename / language header, a copy button ("Copied" feedback plus a polite live announcement), optional line numbers, highlighted lines, a soft-wrap toggle and a max height. Default colouring is a minimal tokenizer for ts/tsx/js/json/bash/css that only uses contrast-safe text tokens; pass `highlight` to plug in another highlighter. Code is the inline variant for running text.',
  pattern: 'button · region',
  keyboard: [
    ['Tab', 'Moves through the wrap toggle, the copy button and the scrollable code region'],
    ['Enter', 'Copies the code (on the copy button) or toggles wrapping (on the wrap toggle)'],
    ['Space', 'Same as Enter'],
    ['Arrow keys', 'Scroll the focused code region'],
  ],
  tokens: ['card', 'background', 'border', 'secondary', 'foreground', 'muted-foreground', 'primary', 'primary-text', 'warning-text', 'destructive-text', 'focus-ring'],
};
