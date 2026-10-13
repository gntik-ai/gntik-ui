export const labelDocs = [
  ['region', 'string', 'all states: search landmark name'],
  ['search', 'string', 'all states: searchbox name'],
  ['placeholder', 'string', 'empty query: searchbox placeholder'],
  ['savedView', 'string', 'saved views present: combobox name'],
  ['savedViews', 'string', 'no saved view selected: combobox placeholder'],
  ['addFilter', 'string', 'initial and menu open: Add filter trigger'],
  ['activeFilters', 'string', 'filter chips or query present: list name'],
  ['filters', 'string', 'filter chips or query present: visible chip heading'],
  ['clearAll', 'string', 'filter chips or query present: clear button'],
  [
    'removeFilter',
    '(field: string, value: string) => string',
    'chip shown and remove focused: remove button name; arguments are caller field / option labels',
  ],
  ['resultCount', '(count: number) => string', 'resultCount supplied (one or many): whole polite live region'],
] as const;
