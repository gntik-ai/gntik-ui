import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Text',
  group: 'Display',
  status: 'stable',
  description:
    'Type roles on the brand scale. Text: body, label, supporting, caption, code and display, with tones (default, muted, primary, success, warning, destructive — contrast-safe *-text aliases). Heading: semantic level 1–6 with an independent visual size. Both truncate or clamp to N lines and render any element via `as` / `render`.',
  primitive: '@base-ui/react/use-render',
  tokens: ['foreground', 'muted-foreground', 'primary-text', 'success-text', 'warning-text', 'destructive-text', 'secondary'],
};
