import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Token',
  group: 'Display',
  status: 'beta',
  description: 'Removable chip for active filters and recipient inputs: label with an optional muted prefix ("Region:"), a leading icon or avatar slot, tones (neutral, primary, success, warning, destructive), sizes sm and md, and an accessible "Remove {label}" button. Disabled tokens keep their label but cannot be removed.',
  pattern: 'button (remove)',
  keyboard: [
    ['Tab', 'Moves focus to the remove button'],
    ['Enter', 'Removes the token'],
    ['Space', 'Removes the token'],
    ['Backspace', 'Removes the token while its remove button is focused (also Delete)'],
  ],
  tokens: ['border', 'background', 'foreground', 'muted-foreground', 'secondary', 'primary', 'primary-text', 'success-text', 'warning-text', 'destructive-text', 'focus-ring'],
};
