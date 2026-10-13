import { useI18n } from '@gntik-ai/ui';

export interface FilterBarLabels {
  region?: string;
  search?: string;
  placeholder?: string;
  savedView?: string;
  savedViews?: string;
  addFilter?: string;
  activeFilters?: string;
  filters?: string;
  clearAll?: string;
  removeFilter?: (field: string, value: string) => string;
  /** Whole polite live-region text, with a raw count. */
  resultCount?: (count: number) => string;
}

export function useFilterBarLabels(labels?: FilterBarLabels) {
  const { t } = useI18n();
  return {
    region: labels?.region ?? t('filters.label'),
    search: labels?.search ?? t('common.search'),
    placeholder: labels?.placeholder ?? 'Search by name…',
    savedView: labels?.savedView ?? t('filters.savedView'),
    savedViews: labels?.savedViews ?? t('filters.savedViews'),
    addFilter: labels?.addFilter ?? t('filters.add'),
    activeFilters: labels?.activeFilters ?? t('filters.active'),
    filters: labels?.filters ?? 'Filters',
    clearAll: labels?.clearAll ?? 'Clear all',
    removeFilter: labels?.removeFilter ?? ((field: string, value: string) => t('filters.remove', { field, value })),
  };
}
