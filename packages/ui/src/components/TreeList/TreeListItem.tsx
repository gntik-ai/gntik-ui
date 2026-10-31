import { Collapsible } from '@base-ui/react/collapsible';
import {
  createElement,
  memo,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { useLinkComponent } from '../Link/Link';
import type { TreeNode } from './tree-model';

/** Keep the last open contents mounted for the panel's exit transition. */
const Contents = memo(
  function Contents({ children }: { children: ReactNode; open: boolean }) {
    return <>{children}</>;
  },
  (_previous, next) => !next.open,
);

export function TreeListGroup({
  open,
  id,
  className,
  children,
}: {
  open: boolean;
  id?: string;
  className: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) panel.current?.querySelectorAll<HTMLElement>('[tabindex]').forEach((el) => (el.tabIndex = -1));
  }, [open]);
  return (
    <Collapsible.Panel
      render={(props, state) => {
        // Keep the established resting markup. Base UI measures height only for transitions.
        const {
          style,
          id: generatedId,
          'data-open': dataOpen,
          'data-closed': dataClosed,
          ...rest
        } = props as typeof props & { 'data-open'?: string; 'data-closed'?: string };
        void generatedId;
        void dataOpen;
        void dataClosed;
        const measuredHeight = (style as CSSProperties & { '--collapsible-panel-height'?: string })?.[
          '--collapsible-panel-height'
        ];
        const measured = measuredHeight !== undefined && measuredHeight !== 'auto';
        return (
          <ul
            {...rest}
            ref={props.ref}
            role="group"
            id={id}
            className={className}
            style={
              measured || !open || state.transitionStatus === 'starting' || state.transitionStatus === 'ending'
                ? style
                : undefined
            }
            inert={!open || undefined}
            aria-hidden={!open || undefined}
          >
            <Contents open={open}>{children}</Contents>
          </ul>
        );
      }}
      ref={panel}
    />
  );
}

interface TreeListItemProps {
  node: TreeNode;
  branch: boolean;
  open: boolean;
  currentHref?: string;
  groupId?: string;
  itemProps: ComponentPropsWithRef<'li'> & { 'data-id': string };
  row: ReactNode;
  group: ReactNode;
}

export function TreeListItem({ node, branch, open, currentHref, groupId, itemProps, row, group }: TreeListItemProps) {
  const RouterLink = useLinkComponent() ?? 'a';
  const blockDisabled = (event: MouseEvent) => {
    if (node.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const children =
    node.href === undefined ? (
      <>
        {row}
        {group}
      </>
    ) : (
      <>
        {createElement(RouterLink, {
          ...(itemProps as ComponentPropsWithRef<'a'>),
          href: node.disabled ? undefined : node.href,
          'aria-current': node.href === currentHref ? 'page' : undefined,
          'aria-owns': open ? groupId : undefined,
          children: row,
        })}
        {group}
      </>
    );
  const rootProps =
    node.href === undefined
      ? itemProps
      : {
          role: 'none',
          onClickCapture: blockDisabled,
          onAuxClickCapture: blockDisabled,
        };
  return branch ? (
    <Collapsible.Root open={open} render={<li {...rootProps} />}>
      {children}
    </Collapsible.Root>
  ) : (
    <li {...rootProps}>{children}</li>
  );
}
