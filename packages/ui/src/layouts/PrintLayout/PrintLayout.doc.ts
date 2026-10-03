import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'PrintLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Printable document frame for invoices, reports and receipts: an A4 or Letter page (`size`) with margins (`margin`), header and footer slots and a `PageBreak` helper. On screen it is a paper sheet (bg-card / text-card-foreground, border, shadow-sm) on a muted backdrop in the current theme; `print:` variants drop the chrome (no backdrop, border, shadow or outer padding) and an `@page` rule sets paper size and margins (`pageRule`). The header and footer print once, at the top and end of the document. The consuming app should print with the light theme (ThemeProvider `defaultMode="light"`, or `setMode(\'light\')` before `window.print()`); no print-only colours are defined.',
  pattern: 'landmark (main) + labelled article',
  keyboard: [['—', 'None: a static document (the skip link still moves focus to it)']],
  tokens: ['card', 'card-foreground', 'secondary', 'border', 'muted-foreground'],
};
