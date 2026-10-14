import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Filter bar',
  family: 'tables',
  status: 'beta',
  description:
    "Optional exported FilterBarLabels, partial overrides per key: labels['searchRegion']: string (all states, search landmark name); labels['searchLabel']: string (all states, searchbox name); labels['placeholder']: string (all states, search placeholder); labels['savedViewLabel']: string (saved-view select closed or open, name); labels['savedViewPlaceholder']: string (unselected saved-view select, placeholder); labels['addFilter']: string (all states and Add filter menu open, trigger); labels['filtersHeading']: string (active filters or search query, heading); labels['activeFilters']: string (filter selected and chip focused, list name); labels['remove']: (field: string, value: string) => string (filter selected and chip focused, caller field label and value unchanged, remove button name); labels['clearAll']: string (active filters or search query, Clear all button); labels['results']: (count: number) => string (all states with resultCount, raw count, live results returned verbatim); precedence is legacy props then labels then existing I18nProvider catalog then English; formatters render verbatim and receive raw arguments; omitted labels preserve the previous release output. " +
    'Search Input, saved views Select, an Add filter Menu with multi-select per field, removable filter chips and Clear all.',
  uses: ['Input', 'SimpleSelect', 'Menu', 'MenuCheckboxItem', 'Token', 'Button'],
};
