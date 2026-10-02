import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Slider',
  group: 'Forms',
  status: 'stable',
  description:
    'Pick a number or a range on a track. Single or range thumbs (one per value), optional visible label and live value readout, two sizes, works inside Field and Form.',
  primitive: '@base-ui/react/slider',
  pattern: 'slider (multi-thumb for ranges)',
  keyboard: [
    ['ArrowRight / ArrowUp', 'Increases the focused thumb by one step'],
    ['ArrowLeft / ArrowDown', 'Decreases the focused thumb by one step'],
    ['PageUp / PageDown', 'Increases / decreases by the large step'],
    ['Home / End', 'Moves the focused thumb to the minimum / maximum'],
    ['Tab', 'Moves focus between thumbs'],
  ],
  tokens: ['primary', 'secondary', 'background', 'foreground', 'muted-foreground', 'focus-ring'],
};
