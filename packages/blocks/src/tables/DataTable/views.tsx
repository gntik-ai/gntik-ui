import { Bookmark, ChevronDown } from '@gntik-ai/icons';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import type { ColumnWidths, PinnedColumns } from './column-sizing';
import type { SortState } from './data-table-utils';

/** What a saved view captures. Every field is optional: a missing field keeps the table's default. */
export interface DataTableViewState {
  /** Opaque filter state of the page's toolbar (see the table's `filters` / `onFiltersChange`). */
  filters?: unknown;
  sort?: SortState | null;
  hiddenColumns?: readonly string[];
  columnWidths?: ColumnWidths;
  pinnedColumns?: PinnedColumns;
  /** A field key, or `null` for no grouping (function `groupBy`s cannot be saved). */
  groupBy?: string | null;
}

export interface DataTableView {
  id: string;
  name: string;
  state: DataTableViewState;
}

const norm = (s: DataTableViewState) =>
  JSON.stringify({
    filters: s.filters ?? null,
    sort: s.sort ?? null,
    hiddenColumns: [...(s.hiddenColumns ?? [])].sort(),
    columnWidths: Object.fromEntries(Object.entries(s.columnWidths ?? {}).sort(([a], [b]) => a.localeCompare(b))),
    pinnedColumns: { left: s.pinnedColumns?.left ?? [], right: s.pinnedColumns?.right ?? [] },
    groupBy: s.groupBy ?? null,
  });

/** Whether two view states are equivalent (key order and empty values ignored). */
export function sameViewState(a: DataTableViewState, b: DataTableViewState): boolean {
  return norm(a) === norm(b);
}

/** A new view id that does not collide with `views`. */
export function newViewId(name: string, views: readonly DataTableView[]): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'view';
  let id = base;
  for (let i = 2; views.some((v) => v.id === id); i++) id = `${base}-${i}`;
  return id;
}

export interface ViewSwitcherProps {
  views: readonly DataTableView[];
  activeId: string | null;
  /** The table differs from the active view (or from the defaults when none is active). */
  dirty: boolean;
  onSelect: (id: string | null) => void;
  onSaveAs: (name: string) => void;
  onSave: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

const DEFAULT_VALUE = '__default__';

/** "Views" menu: switch between saved views, save the current table as a view, rename, delete, reset. */
export function ViewSwitcher({ views, activeId, dirty, onSelect, onSaveAs, onSave, onRename, onDelete, onReset }: ViewSwitcherProps) {
  const inputId = useId();
  const active = views.find((v) => v.id === activeId) ?? null;
  const [dialog, setDialog] = useState<'create' | 'rename' | null>(null);
  const [name, setName] = useState('');
  const open = (mode: 'create' | 'rename') => {
    setName(mode === 'rename' && active ? active.name : '');
    setDialog(mode);
  };
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (dialog === 'rename' && active) onRename(active.id, trimmed);
    else onSaveAs(trimmed);
    setDialog(null);
  };
  return (
    <>
      <Menu>
        <MenuTrigger render={<Button variant="secondary" size="sm" icon={Bookmark} trailingIcon={ChevronDown} />}>
          <span className="max-w-40 truncate">{active ? active.name : 'Default view'}</span>
          {dirty && (
            <>
              {' '}
              <span aria-hidden className="size-1.5 rounded-full bg-primary" /> <span className="sr-only">(modified)</span>
            </>
          )}
        </MenuTrigger>
        <MenuContent align="end" className="min-w-[220px]">
          <MenuGroup>
            <MenuGroupLabel>Views</MenuGroupLabel>
            <MenuRadioGroup value={activeId ?? DEFAULT_VALUE} onValueChange={(v: unknown) => onSelect(v === DEFAULT_VALUE ? null : String(v))}>
              <MenuRadioItem value={DEFAULT_VALUE}>Default view</MenuRadioItem>
              {views.map((v) => (
                <MenuRadioItem key={v.id} value={v.id}>
                  {v.name}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem disabled={!active || !dirty} onClick={onSave}>
            Save changes
          </MenuItem>
          <MenuItem onClick={() => open('create')}>Save as new view…</MenuItem>
          <MenuItem disabled={!active} onClick={() => open('rename')}>
            Rename view…
          </MenuItem>
          <MenuItem disabled={!active} onClick={() => active && onDelete(active.id)}>
            Delete view
          </MenuItem>
          <MenuItem disabled={!dirty} onClick={onReset}>
            Reset changes
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog open={dialog != null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent size="sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <DialogHeader>
              <DialogTitle>{dialog === 'rename' ? 'Rename view' : 'Save view'}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <label htmlFor={inputId} className="mb-1.5 block text-[12.5px] font-medium text-foreground">
                View name
              </label>
              <Input id={inputId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
            </DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button type="submit" disabled={!name.trim()}>
                {dialog === 'rename' ? 'Rename' : 'Save view'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
