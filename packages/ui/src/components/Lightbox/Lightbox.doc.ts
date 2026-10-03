import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Lightbox',
  group: 'Overlays',
  status: 'beta',
  description:
    'Full-screen image and video viewer: previous / next, zoom (buttons, keys or double click) with a scrollable stage, captions, a thumbnail strip and an announced position. Modal: focus is trapped, Escape closes and focus returns to the opener.',
  primitive: '@base-ui/react/dialog',
  pattern: 'modal dialog with a labelled thumbnail group',
  keyboard: [
    ['ArrowRight / ArrowLeft', 'Next / previous item (mirrored in RTL)'],
    ['Home / End', 'First / last item'],
    ['+ / -', 'Zoom in / out (images)'],
    ['0', 'Reset zoom'],
    ['Tab / Shift+Tab', 'Moves through zoom, close, previous / next and the thumbnails (trapped)'],
    ['Enter / Space on a thumbnail', 'Shows that item'],
    ['Escape', 'Closes the viewer and returns focus'],
  ],
  tokens: ['background', 'chrome', 'card', 'border', 'foreground', 'muted-foreground', 'primary', 'secondary', 'focus-ring'],
};
