import { useI18n, type PaginationLabels } from '@gntik-ai/ui';

export interface PaginationFooterLabels extends PaginationLabels {
  /** Visible text beside the page-size select. */
  rowsPerPage?: string;
  /** Accessible name of the page-size select. */
  rowsPerPageLabel?: string;
  /** Inclusive row bounds and total, as numbers before locale formatting. Returned verbatim. */
  range?: (from: number, to: number, total: number) => string;
}

/** Existing catalog keys provide the defaults (English without a provider). */
export function usePaginationFooterLabels(labels: PaginationFooterLabels | undefined, noun: string) {
  const { t } = useI18n();
  return {
    rowsPerPage: labels?.rowsPerPage ?? t('table.rowsPerPage'),
    rowsPerPageLabel: labels?.rowsPerPageLabel ?? t('table.rowsPerPage'),
    nav: labels?.nav ?? t('table.pagination', { noun }),
    previous: labels?.previous ?? t('pagination.previous'),
    next: labels?.next ?? t('pagination.next'),
    page: labels?.page ?? ((page: number) => t('pagination.page', { page })),
  };
}
