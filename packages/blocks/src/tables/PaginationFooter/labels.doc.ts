/** Key, public type and interaction state, exposed through list_kit / get_block. */
export const labelDocs = [
  ['rowsPerPage', 'string', 'initial and select open: caption and combobox name'],
  [
    'rangeSummary',
    '(from: number, to: number, total: number) => string',
    'initial, page changed and size changed: whole polite live region',
  ],
  ['pagination', '(noun: string) => string', 'all pagination states: navigation name; noun is caller content'],
  ['previous', 'string', 'all pagination states: previous button name'],
  ['next', 'string', 'all pagination states: next button name'],
  [
    'page',
    '(page: number) => string',
    'all pagination states: numbered button name; visible page number is caller data',
  ],
] as const;
