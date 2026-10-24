import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'DownloadButton',
  group: 'Actions',
  status: 'beta',
  description:
    'Saves required data (a string, Blob, or sync/async getter) as fileName. mimeType defaults to the Blob type, otherwise text/plain;charset=utf-8; extensions are not inferred. Inherits Button props, with a Download icon and translated default label. Async getters use Button loading, stay focusable and ignore repeat activation. onDownloaded fires after saving; onDownloadError receives failures, announced politely through LiveAnnouncer or a local status region. The static CSV, async success/failure and one-time JSON examples demonstrate these states and callbacks. downloadFile(data, fileName, mimeType?) is also exported; it removes the temporary anchor, revokes its URL on the next task, and does nothing without object URL support. Browsers differ: iOS Safari may open a tab. Exports are held in memory; use a server export for very large row sets. toCsv(rows, columns, options?) accepts columns with header and value (a row key or getter). Defaults: comma delimiter, header true, BOM false, CRLF, escapeFormulas true. Options also accept semicolon or tab delimiters, header false, BOM true, LF and escapeFormulas false. Null/undefined become empty cells, Dates use ISO, numbers/booleans retain their values and objects use JSON. Text starting with =, +, -, @, TAB or CR gets an apostrophe before CSV quoting; legitimate + or - text also changes. Disabling escapeFormulas is unsafe for spreadsheets. escapeCsvCell(text, delimiter?) always protects formulas and quotes delimiters, double quotes, CR and LF. It shares a name with the templates package helper: import explicitly from @gntik-ai/ui. Its CR-led cells are deliberately quoted, unlike the legacy audit-log helper.',
  primitive: '@base-ui/react/button',
  pattern: 'button + status',
  keyboard: [
    ['Enter', 'Downloads the file'],
    ['Space', 'Downloads the file'],
    ['Tab', 'Moves focus to and from the button, including while pending'],
  ],
  tokens: ['primary', 'primary-foreground', 'focus-ring'],
};
