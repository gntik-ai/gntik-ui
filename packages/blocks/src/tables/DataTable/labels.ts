import { useI18n } from '@gntik-ai/ui';
import type { PaginationFooterLabels } from '../PaginationFooter/labels';
import type { PinSide } from './column-sizing';

export interface ColumnMenuLabels {
  trigger?: string;
  visibleColumns?: string;
  pinColumns?: string;
  pinSide?: (side: PinSide) => string;
  pinLeft?: string;
  pinRight?: string;
  unpinned?: string;
}
export interface DensityLabels {
  label?: string;
  comfortable?: string;
  compact?: string;
}
export interface ViewLabels {
  defaultView?: string;
  modified?: string;
  heading?: string;
  saveChanges?: string;
  saveAs?: string;
  renameView?: string;
  deleteView?: string;
  resetChanges?: string;
  saveTitle?: string;
  renameTitle?: string;
  name?: string;
  cancel?: string;
  save?: string;
  rename?: string;
  close?: string;
}
export interface SelectionLabels {
  heading?: string;
  selectAll?: string;
  selectRow?: (label: string) => string;
  selectedCount?: (count: number) => string;
}
export interface GroupingLabels {
  noGroup?: string;
  groupRowCount?: (count: number) => string;
  selectGroup?: (groupName: string) => string;
}
export interface ResizeLabels {
  column?: (header: string) => string;
  value?: (width: number) => string;
}
export interface EditLabels {
  label?: (header: string, rowLabel: string) => string;
  invalidNumber?: string;
  minimum?: (min: number) => string;
  maximum?: (max: number) => string;
  saveError?: string;
}

/** Each nested object merges per key over the existing catalog / hardcoded defaults. */
export interface DataTableLabels {
  columnMenu?: ColumnMenuLabels;
  density?: DensityLabels;
  views?: ViewLabels;
  selection?: SelectionLabels;
  actions?: { heading?: string; rowActions?: (label: string) => string };
  loading?: (caption: string) => string;
  editHint?: string;
  grouping?: GroupingLabels;
  empty?: { title?: string; description?: string };
  resize?: ResizeLabels;
  edit?: EditLabels;
  scrollContainer?: string;
  pagination?: PaginationFooterLabels;
}

export function useColumnMenuLabels(labels?: ColumnMenuLabels): Required<ColumnMenuLabels> {
  const { t } = useI18n();
  return {
    trigger: labels?.trigger ?? t('table.columns'),
    visibleColumns: labels?.visibleColumns ?? t('table.visibleColumns'),
    pinColumns: labels?.pinColumns ?? 'Pin columns',
    pinSide: labels?.pinSide ?? ((side) => (side === 'left' ? 'Left' : 'Right')),
    pinLeft: labels?.pinLeft ?? 'Pin left',
    pinRight: labels?.pinRight ?? 'Pin right',
    unpinned: labels?.unpinned ?? 'Unpinned',
  };
}
export function useDensityLabels(labels?: DensityLabels): Required<DensityLabels> {
  const { t } = useI18n();
  return {
    label: labels?.label ?? t('table.density'),
    comfortable: labels?.comfortable ?? t('table.comfortable'),
    compact: labels?.compact ?? t('table.compact'),
  };
}
export function useViewLabels(labels?: ViewLabels): Required<ViewLabels> {
  const { t } = useI18n();
  return {
    defaultView: labels?.defaultView ?? 'Default view',
    modified: labels?.modified ?? '(modified)',
    heading: labels?.heading ?? 'Views',
    saveChanges: labels?.saveChanges ?? 'Save changes',
    saveAs: labels?.saveAs ?? 'Save as new view…',
    renameView: labels?.renameView ?? 'Rename view…',
    deleteView: labels?.deleteView ?? 'Delete view',
    resetChanges: labels?.resetChanges ?? 'Reset changes',
    saveTitle: labels?.saveTitle ?? 'Save view',
    renameTitle: labels?.renameTitle ?? 'Rename view',
    name: labels?.name ?? 'View name',
    cancel: labels?.cancel ?? 'Cancel',
    save: labels?.save ?? 'Save view',
    rename: labels?.rename ?? 'Rename',
    close: labels?.close ?? t('common.close'),
  };
}

export function useTableContentLabels(labels?: DataTableLabels) {
  const { t } = useI18n();
  return {
    selection: {
      heading: labels?.selection?.heading ?? t('table.selection'),
      selectAll: labels?.selection?.selectAll ?? t('table.selectAllPage'),
      selectRow: labels?.selection?.selectRow ?? ((label: string) => t('table.selectRow', { label })),
    },
    actions: {
      heading: labels?.actions?.heading ?? t('table.actions'),
      rowActions: labels?.actions?.rowActions ?? ((label: string) => t('table.rowActions', { label })),
    },
    editHint: labels?.editHint ?? 'Press Enter or F2 to edit.',
    grouping: {
      noGroup: labels?.grouping?.noGroup ?? 'No group',
      selectGroup:
        labels?.grouping?.selectGroup ??
        ((groupName: string) => t('table.selectRow', { label: `all in ${groupName}` })),
    },
    empty: {
      title: labels?.empty?.title ?? t('common.noResults'),
      description: labels?.empty?.description ?? t('table.emptyDescription'),
    },
  };
}
export function resolveResizeLabels(labels?: ResizeLabels): Required<ResizeLabels> {
  return {
    column: labels?.column ?? ((header) => `Resize ${header} column`),
    value: labels?.value ?? ((width) => `${width} pixels`),
  };
}
export function resolveEditLabels(labels?: EditLabels): Required<EditLabels> {
  return {
    label: labels?.label ?? ((header, rowLabel) => `${header} for ${rowLabel}`),
    invalidNumber: labels?.invalidNumber ?? 'Enter a number.',
    minimum: labels?.minimum ?? ((min) => `Enter ${min} or more.`),
    maximum: labels?.maximum ?? ((max) => `Enter ${max} or less.`),
    saveError: labels?.saveError ?? 'The change could not be saved.',
  };
}
