import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Lightbox',
  group: 'Overlays',
  status: 'beta',
  description:
    'Full-screen image and video viewer: previous / next, zoom (buttons, keys or double click) with a scrollable stage, captions, a thumbnail strip and an announced position. Modal: focus is trapped, Escape closes and focus returns to the opener. Built-in labels follow I18nProvider (en/es); caller overrides take precedence. See the TransferList catalog defaults example for a live Spanish preview of this component.',
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
  dataAttributes: [
    ['data-starting-style', 'backdrop', 'The part is entering.'],
    ['data-ending-style', 'backdrop', 'The part is leaving.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
  ],
  tokens: [
    'background',
    'chrome',
    'card',
    'border',
    'foreground',
    'muted-foreground',
    'primary',
    'secondary',
    'focus-ring',
  ],
};
