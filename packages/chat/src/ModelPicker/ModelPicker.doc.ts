import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ModelPicker',
  group: 'Forms',
  status: 'beta',
  description:
    'Choose the model (and provider) for a conversation: options grouped by provider with a description, capability badges (vision, tools, reasoning, files, web, audio) and the context size; unavailable models stay listed, disabled, with the reason. `compact` gives a small borderless trigger for the ChatComposer toolbar. Controlled (`value` + `onValueChange`).',
  primitive: 'Select',
  pattern: 'select-only combobox',
  keyboard: [
    ['Enter / Space / ArrowDown', 'On the trigger: opens the list'],
    ['ArrowDown / ArrowUp', 'Moves between models; a disabled one can be highlighted (its reason is read) but not selected'],
    ['Type a character', 'Jumps to the model whose name starts with it'],
    ['Enter', 'Selects the highlighted model and closes'],
    ['Escape', 'Closes without changing; focus returns to the trigger'],
  ],
  tokens: ['background', 'popover', 'border', 'secondary', 'primary', 'primary-text', 'muted-foreground', 'focus-ring'],
};
