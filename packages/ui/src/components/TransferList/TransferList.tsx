import { useI18n } from '../../i18n/I18nProvider';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../Button';
import { TransferListPane, type TransferListItem } from './TransferListPane';
import { transferListVariants } from './transfer-list.variants';

export interface TransferListLabels {
  available: string;
  selected: string;
  searchAvailable: string;
  searchSelected: string;
  searchPlaceholder: string;
  add: string;
  addAll: string;
  remove: string;
  removeAll: string;
  moveUp: string;
  moveDown: string;
  actions: string;
  emptyAvailable: string;
  emptySelected: string;
  noMatches: string;
  reorderHint: string;
  count: (checked: number, total: number) => string;
  added: (n: number) => string;
  removed: (n: number) => string;
  moved: string;
}

export interface TransferListProps {
  /** Render only the visible rows in each pane. Default false. */
  virtualized?: boolean;
  items: TransferListItem[];
  /** Selected values, in order (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  /** Show a search field above each list. */
  searchable?: boolean;
  /** Allow reordering the selected list. */
  reorderable?: boolean;
  /** Height of each list (px or CSS length). */
  height?: number | string;
  titles?: { available?: ReactNode; selected?: ReactNode };
  labels?: Partial<TransferListLabels>;
  className?: string;
}

/**
 * Two lists, available and selected: check items (click, Space, Shift+Arrow, Ctrl+A), move
 * them across with the middle buttons, Enter or a double click, and reorder the selected list
 * (Alt+Arrow or the move buttons). Each list is a multi-select listbox with search.
 */
export function TransferList({
  items,
  value,
  defaultValue = [],
  onValueChange,
  searchable = true,
  reorderable = true,
  height = 240,
  titles,
  labels: labelsProp,
  className,
  virtualized = false,
}: TransferListProps) {
  const { t } = useI18n();
  const labels: TransferListLabels = {
    available: t('transferList.available'),
    selected: t('transferList.selected'),
    searchAvailable: t('transferList.searchAvailable'),
    searchSelected: t('transferList.searchSelected'),
    searchPlaceholder: t('transferList.searchPlaceholder'),
    add: t('transferList.add'),
    addAll: t('transferList.addAll'),
    remove: t('transferList.remove'),
    removeAll: t('transferList.removeAll'),
    moveUp: t('transferList.moveUp'),
    moveDown: t('transferList.moveDown'),
    actions: t('transferList.actions'),
    emptyAvailable: t('transferList.emptyAvailable'),
    emptySelected: t('transferList.emptySelected'),
    reorderHint: t('transferList.reorderHint'),
    moved: t('transferList.moved'),
    noMatches: t('common.noMatches'),
    count: (checked, total) => (checked ? `${checked}/${total}` : String(total)),
    added: (count) => t('transferList.added', { count }),
    removed: (count) => t('transferList.removed', { count }),
    ...labelsProp,
  };
  const [inner, setInner] = useState<string[]>(defaultValue);
  const selectedValues = value ?? inner;
  const [checkedLeft, setCheckedLeft] = useState<Set<string>>(new Set());
  const [checkedRight, setCheckedRight] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');
  const id = useId();
  const s = transferListVariants();

  const byValue = new Map(items.map((it) => [it.value, it]));
  const selectedSet = new Set(selectedValues);
  const available = items.filter((it) => !selectedSet.has(it.value));
  const selected = selectedValues.map((v) => byValue.get(v)).filter((it): it is TransferListItem => !!it);

  const commit = (next: string[], message: string) => {
    setInner(next);
    onValueChange?.(next);
    setAnnouncement(message);
  };

  const add = (values: string[]) => {
    const movable = values.filter((v) => !byValue.get(v)?.disabled && !selectedSet.has(v));
    if (!movable.length) return;
    commit([...selectedValues, ...movable], labels.added(movable.length));
    setCheckedLeft(new Set([...checkedLeft].filter((v) => !movable.includes(v))));
  };

  const remove = (values: string[]) => {
    const movable = values.filter((v) => !byValue.get(v)?.disabled);
    if (!movable.length) return;
    commit(
      selectedValues.filter((v) => !movable.includes(v)),
      labels.removed(movable.length),
    );
    setCheckedRight(new Set([...checkedRight].filter((v) => !movable.includes(v))));
  };

  const reorder = (values: string[], delta: -1 | 1) => {
    const next = [...selectedValues];
    const set = new Set(values);
    const order = delta === -1 ? next.map((_, i) => i) : next.map((_, i) => next.length - 1 - i);
    let changed = false;
    for (const i of order) {
      const j = i + delta;
      const cur = next[i];
      const other = next[j];
      if (cur === undefined || other === undefined || !set.has(cur) || set.has(other)) continue;
      next[i] = other;
      next[j] = cur;
      changed = true;
    }
    if (changed) commit(next, labels.moved);
  };

  const checkedRightValues = selectedValues.filter((v) => checkedRight.has(v));

  return (
    <div className={cn(s.root(), className)}>
      <TransferListPane
        id={`${id}-available`}
        title={titles?.available ?? labels.available}
        items={available}
        checked={checkedLeft}
        onCheckedChange={setCheckedLeft}
        onTransfer={add}
        searchable={searchable}
        searchLabel={labels.searchAvailable}
        searchPlaceholder={labels.searchPlaceholder}
        emptyText={labels.emptyAvailable}
        noMatchesText={labels.noMatches}
        countLabel={labels.count}
        height={height}
        virtualized={virtualized}
      />
      <div role="group" aria-label={labels.actions} className={s.actions()}>
        <IconButton
          size="sm"
          variant="secondary"
          icon={ChevronRight}
          label={labels.add}
          className="rtl:[&_svg]:-scale-x-100"
          disabled={!checkedLeft.size}
          onClick={() => add([...checkedLeft])}
        />
        <IconButton
          size="sm"
          variant="secondary"
          icon={ChevronsRight}
          label={labels.addAll}
          className="rtl:[&_svg]:-scale-x-100"
          disabled={!available.some((it) => !it.disabled)}
          onClick={() => add(available.map((it) => it.value))}
        />
        <IconButton
          size="sm"
          variant="secondary"
          icon={ChevronLeft}
          label={labels.remove}
          className="rtl:[&_svg]:-scale-x-100"
          disabled={!checkedRight.size}
          onClick={() => remove([...checkedRight])}
        />
        <IconButton
          size="sm"
          variant="secondary"
          icon={ChevronsLeft}
          label={labels.removeAll}
          className="rtl:[&_svg]:-scale-x-100"
          disabled={!selected.some((it) => !it.disabled)}
          onClick={() => remove(selected.map((it) => it.value))}
        />
      </div>
      <TransferListPane
        id={`${id}-selected`}
        title={titles?.selected ?? labels.selected}
        items={selected}
        checked={checkedRight}
        onCheckedChange={setCheckedRight}
        onTransfer={remove}
        onReorder={reorderable ? reorder : undefined}
        searchable={searchable}
        searchLabel={labels.searchSelected}
        searchPlaceholder={labels.searchPlaceholder}
        emptyText={labels.emptySelected}
        noMatchesText={labels.noMatches}
        countLabel={labels.count}
        height={height}
        virtualized={virtualized}
        footer={
          reorderable ? (
            <>
              <IconButton
                size="sm"
                icon={ArrowUp}
                label={labels.moveUp}
                disabled={!checkedRightValues.length}
                onClick={() => reorder(checkedRightValues, -1)}
              />
              <IconButton
                size="sm"
                icon={ArrowDown}
                label={labels.moveDown}
                disabled={!checkedRightValues.length}
                onClick={() => reorder(checkedRightValues, 1)}
              />
              <span className={s.footHint()}>{labels.reorderHint}</span>
            </>
          ) : undefined
        }
      />
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
