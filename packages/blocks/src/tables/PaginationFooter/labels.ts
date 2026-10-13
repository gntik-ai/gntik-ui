import { useI18n } from '@gntik-ai/ui';

/** Optional per-surface overrides. Formatters receive raw numbers / caller content. */
export interface PaginationFooterLabels {
  rowsPerPage?: string;
  /** Whole polite live-region text; no fragments are added. */
  rangeSummary?: (from: number, to: number, total: number) => string;
  /** Navigation name; noun is caller content (or table.rows from the catalog). */
  pagination?: (noun: string) => string;
  previous?: string;
  next?: string;
  page?: (page: number) => string;
}

export function usePaginationFooterLabels(labels?: PaginationFooterLabels) {
  const { t } = useI18n();
  return {
    rowsPerPage: labels?.rowsPerPage ?? t('table.rowsPerPage'),
    pagination: labels?.pagination ?? ((noun: string) => t('table.pagination', { noun })),
    previous: labels?.previous ?? t('pagination.previous'),
    next: labels?.next ?? t('pagination.next'),
    page: labels?.page ?? ((page: number) => t('pagination.page', { page })),
  };
}
