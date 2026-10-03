import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'InspectorLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Main area with a pinnable right panel (properties, details, comments). Pinned, the panel docks beside the content; unpinned, it overlays it (flat shadow) and Escape closes it. Open and pinned states are controllable; an InspectorToggle placed in the main area opens and closes it. Below lg the panel opens as a bottom Drawer. Fills its container.',
  primitive: '@base-ui/react/drawer (small screens)',
  pattern: 'disclosure (toggle → complementary panel) + toggle button (pin)',
  keyboard: [
    ['Enter / Space', 'On the panel toggle: opens or closes the panel (aria-expanded); an overlaying panel takes focus'],
    ['Enter / Space', 'On Pin panel: docks or un-docks the panel (aria-pressed)'],
    ['Escape', 'Closes the unpinned panel and returns focus to the toggle'],
    ['Escape', 'Small screens: closes the bottom drawer'],
  ],
  tokens: ['background', 'card', 'border', 'foreground', 'muted-foreground', 'focus-ring'],
};
