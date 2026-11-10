import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Slider',
  group: 'Forms',
  status: 'stable',
  description:
    'Pick a number or a range on a track. Single or range thumbs (one per value), optional visible label and live value readout, two sizes, works inside Field and Form. The optional invalid prop exposes aria-invalid on every thumb input and destructive thumb borders; invalid Field works without the prop. Pair invalid with a FieldError or description explaining the allowed values; colour alone is insufficient.',
  // Invalid state is demonstrated in SliderInvalid.
  primitive: '@base-ui/react/slider',
  pattern: 'slider (multi-thumb for ranges)',
  keyboard: [
    ['ArrowRight / ArrowUp', 'Increases the focused thumb by one step'],
    ['ArrowLeft / ArrowDown', 'Decreases the focused thumb by one step'],
    ['PageUp / PageDown', 'Increases / decreases by the large step'],
    ['Home / End', 'Moves the focused thumb to the minimum / maximum'],
    ['Tab', 'Moves focus between thumbs'],
  ],
  dataAttributes: [
    ['data-invalid', 'root', 'The control value is invalid; descendant thumb borders show the error.'],
    ['data-index', 'root', 'Targets descendant thumbs by their zero-based index when styling an invalid root.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-disabled', 'control', 'The control cannot be changed or activated.'],
    ['data-dragging', 'thumb', 'The part is being dragged.'],
    ['data-disabled', 'thumb', 'The control cannot be changed or activated.'],
  ],
  tokens: ['destructive', 'primary', 'secondary', 'background', 'foreground', 'muted-foreground', 'focus-ring'],
};
