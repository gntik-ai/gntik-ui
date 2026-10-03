import { Check, ChevronRight } from 'lucide-react';
import { useId, useRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner';
import { childrenOf, type TreeNode, type VisibleNode } from './tree-model';
import { treeListVariants } from './tree-list.variants';
import { useTreeList, type UseTreeListOptions } from './useTreeList';

export interface TreeListLabels {
  loading: string;
  error: string;
  retry: string;
}

const DEFAULT_LABELS: TreeListLabels = { loading: 'Loading…', error: 'Could not load items.', retry: 'Retry' };

export interface TreeListProps extends UseTreeListOptions, Omit<HTMLAttributes<HTMLUListElement>, 'className' | 'children' | 'onSelect'> {
  className?: string;
  ref?: Ref<HTMLUListElement>;
  /** Called on Enter or double click of a node (e.g. open a file). */
  onAction?: (node: TreeNode) => void;
  /** Indent per level in px. */
  indent?: number;
  /** Built-in strings (English defaults). */
  labels?: Partial<TreeListLabels>;
}

const s = treeListVariants();

/**
 * Hierarchical list on the WAI-ARIA tree pattern: roving focus, arrow keys (Left/Right
 * collapse/expand), Home/End, typeahead, single or multiple selection and lazily loaded
 * children with a loading state. Label it with `aria-label` or `aria-labelledby`.
 */
export function TreeList({
  nodes,
  expanded,
  defaultExpanded,
  onExpandedChange,
  selectionMode,
  selected,
  defaultSelected,
  onSelectedChange,
  loadChildren,
  onAction,
  indent = 16,
  labels: labelsProp,
  className,
  onKeyDown,
  ...props
}: TreeListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const tree = useTreeList({ nodes, expanded, defaultExpanded, onExpandedChange, selectionMode, selected, defaultSelected, onSelectedChange, loadChildren });
  const items = useRef(new Map<string, HTMLLIElement>());
  const typeahead = useRef({ text: '', at: 0 });
  const baseId = useId();
  const byId = new Map(tree.visible.map((v, i) => [v.node.id, { ...v, rowId: `${baseId}-${i}` }]));
  const multi = tree.selectionMode === 'multiple';

  const focus = (id: string | undefined) => {
    if (id === undefined) return;
    tree.setActiveId(id);
    items.current.get(id)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    const id = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')?.dataset.id;
    const index = tree.visible.findIndex((v) => v.node.id === id);
    const current = tree.visible[index];
    if (event.defaultPrevented || !current) return;
    const { node } = current;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const key = rtl && event.key === 'ArrowLeft' ? 'ArrowRight' : rtl && event.key === 'ArrowRight' ? 'ArrowLeft' : event.key;
    const move = (target: VisibleNode | undefined) => {
      event.preventDefault();
      focus(target?.node.id);
    };

    switch (key) {
      case 'ArrowDown':
        return move(tree.visible[index + 1]);
      case 'ArrowUp':
        return move(tree.visible[index - 1]);
      case 'Home':
        return move(tree.visible[0]);
      case 'End':
        return move(tree.visible.at(-1));
      case 'ArrowRight': {
        event.preventDefault();
        if (!current.branch || node.disabled) return;
        if (!current.expanded) return tree.setOpen(node, true);
        if (tree.loaded[node.id]?.status === 'error') return tree.retry(node);
        const first = tree.visible[index + 1];
        if (first?.parentId === node.id) focus(first.node.id);
        return;
      }
      case 'ArrowLeft':
        event.preventDefault();
        if (current.expanded) return tree.setOpen(node, false);
        return focus(current.parentId);
      case 'Enter':
        event.preventDefault();
        tree.select(node, multi ? 'toggle' : 'replace');
        if (onAction && !node.disabled) onAction(node);
        else if (tree.selectionMode === 'none') tree.setOpen(node, !current.expanded);
        return;
      case ' ':
        event.preventDefault();
        if (tree.selectionMode === 'none') return tree.setOpen(node, !current.expanded);
        return tree.select(node, multi ? 'toggle' : 'replace');
    }
    if (multi && key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      return tree.selectAll();
    }
    if (key.length === 1 && /\S/.test(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const t = typeahead.current;
      t.text = event.timeStamp - t.at > 500 ? key.toLowerCase() : t.text + key.toLowerCase();
      t.at = event.timeStamp;
      // Repeating one character cycles through matches; longer text refines from the current node.
      const repeat = [...t.text].every((c) => c === t.text[0]);
      const query = repeat ? t.text.charAt(0) : t.text;
      const start = index + (repeat ? 1 : 0);
      const order = [...tree.visible.slice(start), ...tree.visible.slice(0, start)];
      focus(order.find((v) => !v.node.disabled && v.node.label.toLowerCase().startsWith(query))?.node.id);
    }
  };

  const handleClick = (event: MouseEvent, v: VisibleNode) => {
    event.stopPropagation();
    if (v.node.disabled) return;
    focus(v.node.id);
    const onChevron = (event.target as HTMLElement).closest('[data-chevron]');
    if (onChevron || tree.selectionMode === 'none') return tree.setOpen(v.node, !v.expanded);
    tree.select(v.node, multi ? 'toggle' : 'replace');
  };

  const renderLevel = (list: TreeNode[]) =>
    list.map((node) => {
      const v = byId.get(node.id);
      if (!v) return null;
      const isSelected = tree.selected.has(node.id);
      const childState = tree.loaded[node.id];
      const kids = v.expanded ? childrenOf(node, tree.loaded) : undefined;
      const v2 = treeListVariants({ selected: isSelected, expanded: v.expanded, disabled: node.disabled });
      const Icon = (v.expanded && node.openIcon) || node.icon;
      const pad = { paddingInlineStart: `${(v.level - 1) * indent + 6}px` };
      return (
        <li
          key={node.id}
          ref={(el) => {
            if (el) items.current.set(node.id, el);
            else items.current.delete(node.id);
          }}
          role="treeitem"
          aria-labelledby={v.rowId}
          data-id={node.id}
          aria-level={v.level}
          aria-posinset={v.posinset}
          aria-setsize={v.setsize}
          aria-expanded={v.branch ? v.expanded : undefined}
          aria-selected={tree.selectionMode === 'none' ? undefined : isSelected}
          aria-disabled={node.disabled || undefined}
          aria-busy={childState?.status === 'loading' || undefined}
          tabIndex={node.id === tree.focusId ? 0 : -1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) tree.setActiveId(node.id);
          }}
          className={s.item()}
        >
          <div data-row id={v.rowId} className={v2.row()} style={pad} onClick={(e) => handleClick(e, v)} onDoubleClick={() => onAction && !node.disabled && onAction(node)}>
            <span data-chevron aria-hidden className={v2.chevron()}>
              {v.branch && <ChevronRight size={14} />}
            </span>
            {multi && (
              <span aria-hidden className={v2.check()}>
                {isSelected && <Check size={11} strokeWidth={3} />}
              </span>
            )}
            {Icon && <Icon size={15} aria-hidden className={v2.icon()} />}
            <span className={s.label()}>{node.content ?? node.label}</span>
            {node.meta != null && <span className={s.meta()}>{node.meta}</span>}
          </div>
          {v.expanded && (kids || childState) && (
            <ul role="group" className={s.group()}>
              {kids && renderLevel(kids)}
              {!kids && childState?.status === 'loading' && (
                <li role="none" className={s.status()} style={{ paddingInlineStart: `${v.level * indent + 6}px` }}>
                  <Spinner size={13} /> {labels.loading}
                </li>
              )}
              {!kids && childState?.status === 'error' && (
                <li role="none" className={cn(s.status(), 'text-destructive-text')} style={{ paddingInlineStart: `${v.level * indent + 6}px` }}>
                  {labels.error}
                  <button
                    type="button"
                    tabIndex={-1}
                    className="underline underline-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      tree.retry(node);
                    }}
                  >
                    {labels.retry}
                  </button>
                </li>
              )}
            </ul>
          )}
        </li>
      );
    });

  return (
    <ul role="tree" aria-multiselectable={multi || undefined} className={cn(s.root(), className)} onKeyDown={handleKeyDown} {...props}>
      {renderLevel(nodes)}
    </ul>
  );
}
