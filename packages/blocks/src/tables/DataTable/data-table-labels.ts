import { useI18n } from '@gntik-ai/ui';
import type { PaginationFooterLabels } from '../PaginationFooter/pagination-footer-labels';

export interface DataTableViewLabels {
  defaultView?: string;
  modified?: string;
  heading?: string;
  saveChanges?: string;
  saveAs?: string;
  rename?: string;
  delete?: string;
  reset?: string;
  saveTitle?: string;
  renameTitle?: string;
  nameLabel?: string;
  cancel?: string;
  saveButton?: string;
  renameButton?: string;
  close?: string;
}

export interface DataTableColumnMenuLabels {
  trigger?: string;
  visibleColumns?: string;
  pinColumns?: string;
  left?: string;
  right?: string;
  pinLeft?: string;
  pinRight?: string;
  unpinned?: string;
  /** Caller column header, unchanged. */
  resize?: (column: string) => string;
  /** Current width in pixels. */
  resizeValue?: (width: number) => string;
}

export interface DataTableDensityLabels {
  label?: string;
  comfortable?: string;
  compact?: string;
}

export interface DataTableSelectionLabels {
  selected?: (count: number) => string;
  selectAll?: string;
  /** Caller row label, unchanged. */
  row?: (label: string) => string;
  /** Group name (including the noGroup fallback), unchanged. */
  group?: (name: string) => string;
  heading?: string;
  actionsHeading?: string;
  rowActions?: (label: string) => string;
}

export interface DataTableStatusLabels {
  caption?: string;
  /** Effective caption, unchanged; a legacy caption prop takes precedence. */
  loading?: (caption: string) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  noGroup?: string;
  /** Raw total rows in the group; returns the text inside the count badge. */
  groupCount?: (count: number) => string;
  /** Total rows in the group; returns only the noun after the count badge. */
  groupRows?: (count: number) => string;
  scrollable?: string;
  editHint?: string;
  /** Caller column header and row label, unchanged. */
  editLabel?: (column: string, row: string) => string;
  saveError?: string;
  enterNumber?: string;
  minNumber?: (min: number) => string;
  maxNumber?: (max: number) => string;
}

/** Each nested group is partial; omitted keys retain catalog fallbacks, then English. */
export interface DataTableLabels {
  views?: DataTableViewLabels;
  columnMenu?: DataTableColumnMenuLabels;
  density?: DataTableDensityLabels;
  selection?: DataTableSelectionLabels;
  status?: DataTableStatusLabels;
  pagination?: PaginationFooterLabels;
}

export const dataTableDefaults = {
  views: {
    defaultView: 'Default view',
    modified: '(modified)',
    heading: 'Views',
    saveChanges: 'Save changes',
    saveAs: 'Save as new view…',
    rename: 'Rename view…',
    delete: 'Delete view',
    reset: 'Reset changes',
    saveTitle: 'Save view',
    renameTitle: 'Rename view',
    nameLabel: 'View name',
    cancel: 'Cancel',
    saveButton: 'Save view',
    renameButton: 'Rename',
    close: 'Close',
  },
  columnMenu: {
    trigger: 'Columns',
    visibleColumns: 'Visible columns',
    pinColumns: 'Pin columns',
    left: 'Left',
    right: 'Right',
    pinLeft: 'Pin left',
    pinRight: 'Pin right',
    unpinned: 'Unpinned',
    resize: (column: string) => `Resize ${column} column`,
    resizeValue: (width: number) => `${width} pixels`,
  },
  density: { label: 'Row density', comfortable: 'Comfortable rows', compact: 'Compact rows' },
  selection: {
    selected: (count: number) => `${count} selected`,
    selectAll: 'Select all rows on this page',
    row: (label: string) => `Select ${label}`,
    group: (name: string) => `Select all in ${name}`,
    heading: 'Selection',
    actionsHeading: 'Actions',
    rowActions: (label: string) => `Actions for ${label}`,
  },
  status: {
    caption: 'Deployments',
    loading: (caption: string) => `Loading ${caption.toLowerCase()}…`,
    emptyTitle: 'No results',
    emptyDescription: 'Nothing matches the current filters.',
    noGroup: 'No group',
    groupCount: (count: number) => String(count),
    groupRows: (count: number): string => (count === 1 ? 'row' : 'rows'),
    scrollable: 'Scrollable table',
    editHint: 'Press Enter or F2 to edit.',
    editLabel: (column: string, row: string) => `${column} for ${row}`,
    saveError: 'The change could not be saved.',
    enterNumber: 'Enter a number.',
    minNumber: (min: number) => `Enter ${min} or more.`,
    maxNumber: (max: number) => `Enter ${max} or less.`,
  },
};

function merge<T extends object>(defaults: T, labels: Partial<T> | undefined): T {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = labels?.[key];
    if (value !== undefined) result[key] = value;
  }
  return result;
}

/** Only strings that already used t() have provider fallbacks. No new catalog keys. */
export function useDataTableLabels(labels?: DataTableLabels) {
  const { t } = useI18n();
  return {
    views: merge({ ...dataTableDefaults.views, close: t('common.close') }, labels?.views),
    columnMenu: merge(
      { ...dataTableDefaults.columnMenu, trigger: t('table.columns'), visibleColumns: t('table.visibleColumns') },
      labels?.columnMenu,
    ),
    density: merge(
      { label: t('table.density'), comfortable: t('table.comfortable'), compact: t('table.compact') },
      labels?.density,
    ),
    selection: merge(
      {
        ...dataTableDefaults.selection,
        selectAll: t('table.selectAllPage'),
        row: (label: string) => t('table.selectRow', { label }),
        group: (name: string) => t('table.selectRow', { label: `all in ${name}` }),
        heading: t('table.selection'),
        actionsHeading: t('table.actions'),
        rowActions: (label: string) => t('table.rowActions', { label }),
      },
      labels?.selection,
    ),
    status: merge(
      {
        ...dataTableDefaults.status,
        emptyTitle: t('common.noResults'),
        emptyDescription: t('table.emptyDescription'),
        scrollable: t('table.scrollable'),
      },
      labels?.status,
    ),
  };
}
