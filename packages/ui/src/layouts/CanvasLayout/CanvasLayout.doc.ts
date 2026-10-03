import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'CanvasLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Editor shell for a full-bleed canvas (flow editor, code editor, map): top bar · left palette · canvas with a floating toolbar · right inspector · collapsible bottom console. Palette and inspector toggle from the top bar; each panel is controllable (`paletteOpen`, `inspectorOpen`, `consoleOpen`). Below `lg` the side panels and toggles hide and a read-only notice ("Open on a larger screen to edit") shows over the canvas. Fills its container; `fullScreen` switches to `h-dvh`.',
  pattern: 'landmarks (header, main, two labelled asides, labelled console region) + disclosure buttons',
  keyboard: [
    ['Tab', 'Skip link first, then the top bar, the panel toggles, the palette, the canvas, the console and the inspector'],
    ['Enter / Space on a panel toggle', 'Shows or hides the palette or inspector (aria-expanded reflects the state)'],
    ['Enter / Space on the console bar', 'Collapses or expands the console (aria-expanded)'],
  ],
  tokens: ['background', 'foreground', 'chrome', 'card', 'border', 'secondary', 'muted-foreground', 'focus-ring'],
};
