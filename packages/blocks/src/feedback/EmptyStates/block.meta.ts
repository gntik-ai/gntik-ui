import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Empty states',
  family: 'feedback',
  status: 'beta',
  description:
    'Four canonical empty states: first run (with checklist), no results (clear filters/search), no access (request access) and not found (optional action). FirstRunEmpty, NoResultsEmpty and NoAccessEmpty accept labels?: Partial<FirstRunEmptyLabels>, Partial<NoResultsEmptyLabels> and Partial<NoAccessEmptyLabels> respectively. Each type has its own keys below; explicit title, description, actionLabel and secondary props win. Defaults follow I18nProvider (en/es). NoResultsEmpty keeps the query in a mono span unless queryTitle replaces the heading. NotFoundEmpty and all imported fixtures stay English. See the Catalog labels live preview.',
  labels: [
    {
      key: 'FirstRunEmpty.labels.title',
      type: 'string',
      state: 'FirstRunEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'FirstRunEmpty.labels.description',
      type: 'string',
      state: 'FirstRunEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'FirstRunEmpty.labels.action',
      type: 'string',
      state: 'FirstRunEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'FirstRunEmpty.labels.guide',
      type: 'string',
      state: 'FirstRunEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoResultsEmpty.labels.queryTitle',
      type: '(entity: string, query: string) => string',
      state: 'NoResultsEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoResultsEmpty.labels.title',
      type: '(entity: string) => string',
      state: 'NoResultsEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoResultsEmpty.labels.description',
      type: '(filterCount: number) => string',
      state: 'NoResultsEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoResultsEmpty.labels.clearFilters',
      type: 'string',
      state: 'NoResultsEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoResultsEmpty.labels.clearSearch',
      type: 'string',
      state: 'NoResultsEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoAccessEmpty.labels.title',
      type: '(resource: string) => string',
      state: 'NoAccessEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoAccessEmpty.labels.description',
      type: '(resource: string, owner: string) => string',
      state: 'NoAccessEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoAccessEmpty.labels.request',
      type: 'string',
      state: 'NoAccessEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoAccessEmpty.labels.requested',
      type: 'string',
      state: 'NoAccessEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
    {
      key: 'NoAccessEmpty.labels.sent',
      type: 'string',
      state: 'NoAccessEmpty: per-key override; formatters receive original data. Explicit props win.',
    },
  ],
  uses: ['EmptyState', 'Button', 'Link'],
};
