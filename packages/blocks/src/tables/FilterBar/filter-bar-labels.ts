export interface FilterBarLabels {
  searchRegion?: string;
  searchLabel?: string;
  placeholder?: string;
  savedViewLabel?: string;
  savedViewPlaceholder?: string;
  addFilter?: string;
  filtersHeading?: string;
  activeFilters?: string;
  /** Caller field label and selected option value, unchanged. */
  remove?: (field: string, value: string) => string;
  clearAll?: string;
  /** Raw result count, before number formatting. Returned verbatim. */
  results?: (count: number) => string;
}

/** Strings without an existing catalog entry retain their original English defaults. */
export const filterBarDefaults = {
  placeholder: 'Search by name…',
  filtersHeading: 'Filters',
  clearAll: 'Clear all',
} as const;
