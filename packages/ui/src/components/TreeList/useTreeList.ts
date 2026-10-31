import { useMemo, useRef, useState } from 'react';
import {
  allIds,
  flattenVisible,
  flattenFiltered,
  filterTree,
  isBranch,
  type ChildState,
  type TreeNode,
  type TreeMatcher,
} from './tree-model';

import { matchText } from '../../utils/match-text';

const defaultMatcher: TreeMatcher = (node, query) => matchText(node.label, query);

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

export interface UseTreeListOptions {
  nodes: TreeNode[];
  /** Search loaded labels. Matching branches retain their whole subtree. Debounce large trees. */
  filter?: string;
  filterNode?: TreeMatcher;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectionMode?: TreeSelectionMode;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
}

/** State, async loading and selection for TreeList (controlled or uncontrolled). */
export function useTreeList({
  nodes,
  filter = '',
  filterNode = defaultMatcher,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selectionMode = 'single',
  selected: selectedProp,
  defaultSelected = [],
  onSelectedChange,
  loadChildren,
}: UseTreeListOptions) {
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const [selectedState, setSelectedState] = useState(defaultSelected);
  const [loaded, setLoaded] = useState<Record<string, ChildState>>({});
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const pending = useRef(new Set<string>());

  const expandedIds = expandedProp ?? expandedState;
  const selectedIds = selectedProp ?? selectedState;
  const baseExpanded = useMemo(() => new Set(expandedIds), [expandedIds]);
  const model = useMemo(
    () => (filter ? filterTree(nodes, loaded, filter, filterNode) : null),
    [nodes, loaded, filter, filterNode],
  );
  const [filterState, setFilterState] = useState<{
    model: typeof model;
    expanded: Set<string>;
    filter: string;
    matcher: TreeMatcher;
  }>({ model: null, expanded: new Set(), filter: '', matcher: filterNode });
  // Reset on a new query/data, then leave the user free to collapse its ancestors.
  const sameQuery = filterState.filter === filter && filterState.matcher === filterNode;
  const filterExpanded =
    filterState.model === model
      ? filterState.expanded
      : new Set([
          ...(sameQuery ? filterState.expanded : baseExpanded),
          ...[...(model?.ancestors ?? [])].filter((id) => !sameQuery || !filterState.model?.ancestors.has(id)),
        ]);
  if (filterState.model !== model) setFilterState({ model, expanded: filterExpanded, filter, matcher: filterNode });
  const expanded = model ? filterExpanded : baseExpanded;
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visible = useMemo(
    () => (model ? flattenFiltered(nodes, expanded, loaded, model.included) : flattenVisible(nodes, expanded, loaded)),
    [nodes, expanded, loaded, model],
  );

  const setExpanded = (ids: string[]) => {
    if (expandedProp === undefined) setExpandedState(ids);
    onExpandedChange?.(ids);
  };
  const setSelected = (ids: string[]) => {
    if (selectedProp === undefined) setSelectedState(ids);
    onSelectedChange?.(ids);
  };

  const load = (node: TreeNode) => {
    if (!loadChildren || node.children || pending.current.has(node.id) || loaded[node.id]?.status === 'loaded') return;
    pending.current.add(node.id);
    setLoaded((m) => ({ ...m, [node.id]: { status: 'loading' } }));
    loadChildren(node)
      .then(
        (kids) => setLoaded((m) => ({ ...m, [node.id]: { status: 'loaded', nodes: kids } })),
        () => setLoaded((m) => ({ ...m, [node.id]: { status: 'error' } })),
      )
      .finally(() => pending.current.delete(node.id));
  };

  const setOpen = (node: TreeNode, open: boolean) => {
    if (!isBranch(node) || expanded.has(node.id) === open) return;
    if (open) load(node);
    const next = new Set(expanded);
    if (open) next.add(node.id);
    else next.delete(node.id);
    if (model) setFilterState({ model, expanded: next, filter, matcher: filterNode });
    else setExpanded([...next]);
  };

  const select = (node: TreeNode, mode: 'replace' | 'toggle' = 'replace') => {
    if (selectionMode === 'none' || node.disabled) return;
    if (selectionMode === 'single') return setSelected([node.id]);
    if (mode === 'toggle')
      setSelected(selected.has(node.id) ? selectedIds.filter((id) => id !== node.id) : [...selectedIds, node.id]);
    else setSelected([node.id]);
  };

  const selectAll = () => {
    if (selectionMode === 'multiple')
      setSelected(
        model
          ? [...new Set([...selectedIds, ...visible.filter((v) => !v.node.disabled).map((v) => v.node.id)])]
          : allIds(nodes, loaded),
      );
  };

  /** Re-requests children after a failed load. */
  const retry = (node: TreeNode) => load(node);

  const focusId =
    activeId !== undefined && visible.some((v) => v.node.id === activeId)
      ? activeId
      : model
        ? visible[0]?.node.id
        : (visible.find((v) => selected.has(v.node.id))?.node.id ?? visible[0]?.node.id);

  return {
    visible,
    matched: model?.matched,
    expanded,
    selected,
    loaded,
    focusId,
    setActiveId,
    setOpen,
    select,
    selectAll,
    retry,
    selectionMode,
  };
}
