import { Collapsible } from '@base-ui/react/collapsible';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronDown } from 'lucide-react';
import { createElement, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useLinkComponent } from '../Link';
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuTrigger, menuVariants } from '../Menu';
import { SimpleTooltip } from '../Tooltip';
import { isNavItemCurrent, navItemContainsCurrent, navItemKey, useNavListContext, type NavItem } from './nav-context';
import { navListVariants } from './nav-list.variants';

const ICON_SIZE = { 0: 17, 1: 15 } as const;

/** Accessible name in the rail, where the visible label and badge are hidden. */
function railLabel(item: NavItem) {
  return typeof item.badge === 'string' || typeof item.badge === 'number' ? `${item.label} (${item.badge})` : item.label;
}

function Badge({ item, current }: { item: NavItem; current: boolean }) {
  const { collapsed } = useNavListContext();
  if (item.badge === undefined || item.badge === null || item.badge === false) return null;
  const s = navListVariants({ current });
  if (collapsed) return <span aria-hidden className={s.railBadge()} />;
  // The space keeps the label and count apart in the accessible name ("Projects 12").
  return (
    <>
      {' '}
      <span className={s.badge()}>{item.badge}</span>
    </>
  );
}

function NavLeaf({ item, depth }: { item: NavItem; depth: number }) {
  const RouterLink = useLinkComponent();
  const { collapsed, currentHref, onNavigate } = useNavListContext();
  const current = isNavItemCurrent(item, currentHref);
  const rail = collapsed && depth === 0;
  const s = navListVariants({ collapsed: rail, current });
  const IconCmp = item.icon;
  const content: ReactNode = (
    <>
      {current && depth === 0 && <span aria-hidden className={s.indicator()} />}
      {IconCmp && <IconCmp size={ICON_SIZE[depth === 0 ? 0 : 1]} aria-hidden className={s.icon()} />}
      {!rail && <span className={s.label()}>{item.label}</span>}
      <Badge item={item} current={current} />
    </>
  );
  const props = {
    className: depth === 0 ? s.item() : s.subItem(),
    'aria-current': current ? ('page' as const) : undefined,
    'aria-label': rail ? railLabel(item) : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      item.onClick?.(event);
      onNavigate?.(item);
    },
  };
  let element;
  if (item.href !== undefined) {
    const linkProps = { ...props, href: item.href, 'aria-disabled': item.disabled || undefined, tabIndex: item.disabled ? -1 : undefined };
    element = createElement(RouterLink ?? 'a', linkProps, content);
  } else {
    element = (
      <button type="button" disabled={item.disabled} {...props}>
        {content}
      </button>
    );
  }
  return rail ? (
    <SimpleTooltip content={item.label} side="inline-end" arrow={false}>
      {element}
    </SimpleTooltip>
  ) : (
    element
  );
}

/** Expanded mode: a collapsible section whose sub-items sit on a vertical guide line. */
function NavParent({ item, depth }: { item: NavItem; depth: number }) {
  const { currentHref } = useNavListContext();
  const s = navListVariants({ collapsed: false });
  const IconCmp = item.icon;
  return (
    <Collapsible.Root defaultOpen={item.defaultOpen ?? navItemContainsCurrent(item, currentHref)}>
      <Collapsible.Trigger className={cn('group', depth === 0 ? cn(s.item(), s.parent()) : s.subItem(), 'w-full')}>
        {IconCmp && <IconCmp size={ICON_SIZE[depth === 0 ? 0 : 1]} aria-hidden className={cn(s.icon(), 'text-muted-foreground')} />}
        <span className={s.label()}>{item.label}</span>
        <Badge item={item} current={false} />
        <ChevronDown size={14} aria-hidden className={s.parentChevron()} />
      </Collapsible.Trigger>
      <Collapsible.Panel className={s.panel()}>
        <ul className={s.subList()}>
          {(item.items ?? []).map((child) => (
            <NavListEntry key={navItemKey(child)} item={child} depth={depth + 1} />
          ))}
        </ul>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/** Rail mode: the parent's icon opens a flyout menu listing its sub-items. */
function NavRailFlyout({ item }: { item: NavItem }) {
  const RouterLink = useLinkComponent();
  const { currentHref, onNavigate } = useNavListContext();
  const active = navItemContainsCurrent(item, currentHref);
  const s = navListVariants({ collapsed: true });
  const m = menuVariants();
  const IconCmp = item.icon;
  return (
    <Menu>
      <MenuTrigger aria-label={item.label} className={cn(s.item(), active && 'bg-accent text-accent-foreground')}>
        {active && <span aria-hidden className={s.indicator()} />}
        {IconCmp && <IconCmp size={ICON_SIZE[0]} aria-hidden className={s.icon()} />}
      </MenuTrigger>
      <MenuContent side="inline-end" align="start" sideOffset={10}>
        <MenuGroup>
          <MenuGroupLabel>{item.label}</MenuGroupLabel>
          {(item.items ?? []).map((child) => {
            const current = isNavItemCurrent(child, currentHref);
            const ChildIcon = child.icon;
            return child.href !== undefined ? (
              <BaseMenu.LinkItem
                key={navItemKey(child)}
                href={child.href}
                closeOnClick
                aria-current={current ? 'page' : undefined}
                render={RouterLink ? createElement(RouterLink) : undefined}
                className={cn(m.item(), 'no-underline', current && 'font-semibold text-primary-text')}
                onClick={(event) => {
                  child.onClick?.(event);
                  onNavigate?.(child);
                }}
              >
                {ChildIcon && <ChildIcon size={15} aria-hidden className={m.itemIcon()} />}
                <span className={m.itemLabel()}>{child.label}</span>
              </BaseMenu.LinkItem>
            ) : (
              <MenuItem
                key={navItemKey(child)}
                icon={ChildIcon}
                disabled={child.disabled}
                onClick={(event) => {
                  child.onClick?.(event);
                  onNavigate?.(child);
                }}
              >
                {child.label}
              </MenuItem>
            );
          })}
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

/** One `<li>`: a leaf link/button, a collapsible parent, or (in the rail) a flyout parent. */
export function NavListEntry({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const { collapsed } = useNavListContext();
  let body: ReactNode;
  if (item.items?.length) body = collapsed && depth === 0 ? <NavRailFlyout item={item} /> : <NavParent item={item} depth={depth} />;
  else body = <NavLeaf item={item} depth={depth} />;
  return <li className="relative">{body}</li>;
}
