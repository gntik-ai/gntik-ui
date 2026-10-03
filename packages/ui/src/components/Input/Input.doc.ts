import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Input',
  group: 'Forms',
  status: 'stable',
  description: 'Single-line text input in two sizes (sm, md) with optional leading/trailing icons and addons (prefixes, units, keyboard hints, icon buttons). Invalid, disabled and read-only states; works inside Field.',
  primitive: '@base-ui/react/input',
  pattern: 'textbox',
  keyboard: [
    ['Tab', 'Moves focus into the input; trailing addon buttons follow in tab order'],
    ['Click on label', 'Inside a Field, focuses the input'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'primary', 'destructive', 'secondary', 'focus-ring'],
};
