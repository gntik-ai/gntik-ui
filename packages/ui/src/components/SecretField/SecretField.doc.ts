import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'SecretField',
  group: 'Forms',
  status: 'beta',
  description:
    'A secret value (API key, token, connection string) on Input: masked by default (fixed-length mask, optional visible prefix/suffix), a reveal toggle (aria-pressed), a CopyButton that copies the real value and announces it, an optional Rotate action behind an AlertDialog confirmation, and optional created / last-used meta. Read-only by default (`editable` turns it into a password field). While masked and read-only the secret is not in the DOM, and it is never put in a title or tooltip. `maskSecret` is exported too.',
  primitive: '@base-ui/react/input',
  pattern: 'read-only textbox + toggle button + button',
  keyboard: [
    ['Tab', 'Moves through the field, the reveal toggle, Copy and Rotate'],
    ['Enter / Space', 'On the reveal toggle: shows or hides the value (aria-pressed)'],
    ['Enter / Space', 'On Copy: copies the secret and announces "Secret copied to clipboard"'],
    ['Enter / Space', 'On Rotate: opens the confirmation (focus moves into it)'],
    ['Escape', 'Closes the confirmation without rotating; focus returns to Rotate'],
  ],
  tokens: ['background', 'border', 'secondary', 'foreground', 'muted-foreground', 'primary-text', 'warning', 'focus-ring'],
};
