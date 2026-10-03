import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'PasswordInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Password field on Input with a reveal toggle (aria-pressed) and an optional 4-segment strength meter. Strength comes from a small built-in heuristic or a `strength` prop (0–4); its text is linked to the input with aria-describedby. Works inside Field.',
  primitive: '@base-ui/react/input',
  pattern: 'textbox + toggle button',
  keyboard: [
    ['Tab', 'Moves from the input to the reveal toggle'],
    ['Enter / Space', 'On the toggle: shows or hides the password (aria-pressed)'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'secondary', 'destructive', 'destructive-text', 'warning', 'warning-text', 'success', 'success-text', 'focus-ring'],
};
