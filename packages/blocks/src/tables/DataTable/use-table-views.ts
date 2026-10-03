import { useState } from 'react';
import { newViewId, sameViewState, type DataTableView, type DataTableViewState } from './views';

/** A value that is controlled when `value` is defined, otherwise kept in state. */
export function useControllable<V>(value: V | undefined, initial: V | (() => V), onChange?: (next: V) => void): [V, (next: V) => void] {
  const [inner, setInner] = useState<V>(initial);
  const current = value === undefined ? inner : value;
  const set = (next: V) => {
    setInner(next);
    onChange?.(next);
  };
  return [current, set];
}

export interface UseTableViewsOptions {
  views?: readonly DataTableView[];
  defaultViews?: readonly DataTableView[];
  onViewsChange?: (views: DataTableView[]) => void;
  activeViewId?: string | null;
  defaultActiveViewId?: string | null;
  onActiveViewChange?: (id: string | null) => void;
  /** The table's state right now. */
  current: DataTableViewState;
  /** The table's state with no view applied (props' defaults). */
  defaults: DataTableViewState;
  /** Applies a complete state to the table. */
  apply: (state: DataTableViewState) => void;
}

/** Saved-views state machine for the DataTable: select, save as, save, rename, delete, reset. */
export function useTableViews({ views: viewsProp, defaultViews = [], onViewsChange, activeViewId, defaultActiveViewId = null, onActiveViewChange, current, defaults, apply }: UseTableViewsOptions) {
  const [views, setViews] = useControllable<readonly DataTableView[]>(viewsProp, defaultViews, (next) => onViewsChange?.([...next]));
  const [activeId, setActiveId] = useControllable<string | null>(activeViewId, defaultActiveViewId, onActiveViewChange);
  const active = views.find((v) => v.id === activeId) ?? null;
  const target = (view: DataTableView | null): DataTableViewState => ({ ...defaults, ...(view?.state ?? {}) });
  const dirty = !sameViewState(current, target(active));

  return {
    views,
    activeId: active ? active.id : null,
    dirty,
    select: (id: string | null) => {
      const view = views.find((v) => v.id === id) ?? null;
      setActiveId(view ? view.id : null);
      apply(target(view));
    },
    saveAs: (name: string) => {
      const view: DataTableView = { id: newViewId(name, views), name, state: current };
      setViews([...views, view]);
      setActiveId(view.id);
    },
    save: () => {
      if (!active) return;
      setViews(views.map((v) => (v.id === active.id ? { ...v, state: current } : v)));
    },
    rename: (id: string, name: string) => setViews(views.map((v) => (v.id === id ? { ...v, name } : v))),
    remove: (id: string) => {
      setViews(views.filter((v) => v.id !== id));
      if (id === activeId) setActiveId(null);
    },
    reset: () => apply(target(active)),
  };
}
