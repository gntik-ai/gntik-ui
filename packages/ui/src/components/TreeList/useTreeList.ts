import { useMemo, useRef, useState } from 'react';
import { allIds, flattenVisible, isBranch, type ChildState, type TreeNode } from './tree-model';

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

export interface UseTreeListOptions {
  nodes: TreeNode[];
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
  const expanded = useMemo(() => new Set(expandedIds), [expandedIds]);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visible = useMemo(() => flattenVisible(nodes, expanded, loaded), [nodes, expanded, loaded]);

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
    loadChildren(node).then(
      (kids) => setLoaded((m) => ({ ...m, [node.id]: { status: 'loaded', nodes: kids } })),
      () => setLoaded((m) => ({ ...m, [node.id]: { status: 'error' } })),
    ).finally(() => pending.current.delete(node.id));
  };

  const setOpen = (node: TreeNode, open: boolean) => {
    if (!isBranch(node) || expanded.has(node.id) === open) return;
    if (open) load(node);
    setExpanded(open ? [...expandedIds, node.id] : expandedIds.filter((id) => id !== node.id));
  };

  const select = (node: TreeNode, mode: 'replace' | 'toggle' = 'replace') => {
    if (selectionMode === 'none' || node.disabled) return;
    if (selectionMode === 'single') return setSelected([node.id]);
    if (mode === 'toggle') setSelected(selected.has(node.id) ? selectedIds.filter((id) => id !== node.id) : [...selectedIds, node.id]);
    else setSelected([node.id]);
  };

  const selectAll = () => {
    if (selectionMode === 'multiple') setSelected(allIds(nodes, loaded));
  };

  /** Re-requests children after a failed load. */
  const retry = (node: TreeNode) => load(node);

  const focusId = activeId !== undefined && visible.some((v) => v.node.id === activeId) ? activeId : (visible.find((v) => selected.has(v.node.id))?.node.id ?? visible[0]?.node.id);

  return { visible, expanded, selected, loaded, focusId, setActiveId, setOpen, select, selectAll, retry, selectionMode };
}
