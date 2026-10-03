import type { ComponentType, ReactNode } from 'react';

export type TreeIcon = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface TreeNode {
  id: string;
  /** Plain-text label; also used by typeahead. */
  label: string;
  /** Rich row content shown instead of `label` (which stays the typeahead text). */
  content?: ReactNode;
  /** Secondary text at the inline end (count, size, status). */
  meta?: ReactNode;
  /** Leading icon. */
  icon?: TreeIcon;
  /** Icon while expanded (e.g. FolderOpen). */
  openIcon?: TreeIcon;
  children?: TreeNode[];
  /** Has children that `loadChildren` fetches on first expand. */
  hasChildren?: boolean;
  disabled?: boolean;
}

export type ChildState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; nodes: TreeNode[] };

export interface VisibleNode {
  node: TreeNode;
  level: number;
  parentId: string | undefined;
  posinset: number;
  setsize: number;
  /** Has (or may lazily have) children. */
  branch: boolean;
  expanded: boolean;
}

export function childrenOf(node: TreeNode, loaded: Record<string, ChildState>) {
  if (node.children) return node.children;
  const state = loaded[node.id];
  return state?.status === 'loaded' ? state.nodes : undefined;
}

export function isBranch(node: TreeNode) {
  return (node.children?.length ?? 0) > 0 || node.hasChildren === true;
}

/** Depth-first list of the nodes a user can currently see (ancestors expanded). */
export function flattenVisible(nodes: TreeNode[], expanded: ReadonlySet<string>, loaded: Record<string, ChildState>) {
  const out: VisibleNode[] = [];
  const walk = (list: TreeNode[], level: number, parentId: string | undefined) => {
    list.forEach((node, i) => {
      const branch = isBranch(node);
      const open = branch && expanded.has(node.id);
      out.push({ node, level, parentId, posinset: i + 1, setsize: list.length, branch, expanded: open });
      const kids = open ? childrenOf(node, loaded) : undefined;
      if (kids) walk(kids, level + 1, node.id);
    });
  };
  walk(nodes, 1, undefined);
  return out;
}

/** Every enabled node id in the tree (loaded children included). */
export function allIds(nodes: TreeNode[], loaded: Record<string, ChildState>): string[] {
  return nodes.flatMap((n) => [...(n.disabled ? [] : [n.id]), ...allIds(childrenOf(n, loaded) ?? [], loaded)]);
}
