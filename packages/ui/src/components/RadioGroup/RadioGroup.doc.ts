import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'RadioGroup',
  group: 'Forms',
  status: 'stable',
  description: 'Single choice from a short list. RadioGroup + Radio with optional label, description and trailing content per option, in plain, list (bordered rows) and card variants.',
  primitive: '@base-ui/react/radio-group, @base-ui/react/radio',
  pattern: 'radio group',
  keyboard: [
    ['Tab', 'Enters the group once, on the selected radio (or the first one); Tab again leaves the group'],
    ['Arrow Down / Arrow Right', 'Moves to the next radio and selects it (wraps)'],
    ['Arrow Up / Arrow Left', 'Moves to the previous radio and selects it (wraps)'],
    ['Space', 'Selects the focused radio if it is not already selected'],
  ],
  tokens: ['background', 'border', 'primary', 'primary-foreground', 'foreground', 'muted-foreground', 'destructive', 'focus-ring'],
};
