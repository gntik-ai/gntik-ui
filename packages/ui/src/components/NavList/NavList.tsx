import { Collapsible } from '@base-ui/react/collapsible';
import { ChevronDown } from 'lucide-react';
import { useId, type HTMLAttributes, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { NavContext, navItemKey, useNavListContext, type NavGroup, type NavItem } from './nav-context';
import { navListVariants } from './nav-list.variants';

export type { NavItem, NavGroup, NavIcon } from './nav-context';
import { NavListEntry } from './NavListItem';

export interface NavListProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  groups: NavGroup[];
  /** The current location; the item with this `href` gets aria-current="page". */
  currentHref?: string;
  /** Icon rail: labels hide and become tooltips, group headings become dividers. */
  collapsed?: boolean;
  /** Accessible name of the <nav> landmark. */
  label?: string;
  /** Called after any item is activated (e.g. to close a mobile drawer). */
  onNavigate?: (item: NavItem) => void;
}

function NavGroupSection({ group }: { group: NavGroup }) {
  const { collapsed } = useNavListContext();
  const labelId = useId();
  const s = navListVariants();
  const list = (
    <ul className={s.list()} aria-labelledby={group.label && !collapsed ? labelId : undefined} aria-label={group.label && collapsed ? group.label : undefined}>
      {group.items.map((item) => (
        <NavListEntry key={navItemKey(item)} item={item} />
      ))}
    </ul>
  );

  if (collapsed) {
    return (
      <div className={s.group()}>
        {group.label && <div aria-hidden className={s.railDivider()} />}
        {list}
      </div>
    );
  }

  if (group.collapsible && group.label) {
    return (
      <Collapsible.Root defaultOpen={group.defaultOpen ?? true} className={s.group()}>
        <Collapsible.Trigger className={s.groupTrigger()}>
          <span id={labelId} className={s.groupTriggerLabel()}>
            {group.label}
          </span>
          <ChevronDown size={12} aria-hidden className={s.groupChevron()} />
        </Collapsible.Trigger>
        <Collapsible.Panel className={s.panel()}>{list}</Collapsible.Panel>
      </Collapsible.Root>
    );
  }

  return (
    <div className={s.group()}>
      {group.label && (
        <div id={labelId} className={s.groupLabel()}>
          {group.label}
        </div>
      )}
      {list}
    </div>
  );
}

/**
 * Sidebar navigation: labelled groups (optionally foldable) of items with icon, label, badge and
 * nested collapsible sub-items. The current page gets aria-current="page". `collapsed` turns it
 * into an icon rail with tooltips. Links render through LinkProvider, so client routers work.
 */
export function NavList({ groups, currentHref, collapsed = false, label = 'Main', onNavigate, className, ...props }: NavListProps) {
  const s = navListVariants();
  return (
    <NavContext.Provider value={{ collapsed, currentHref, onNavigate }}>
      <nav aria-label={label} data-collapsed={collapsed || undefined} className={cn(s.root(), className)} {...props}>
        {groups.map((group, i) => (
          <NavGroupSection key={group.id ?? group.label ?? i} group={group} />
        ))}
      </nav>
    </NavContext.Provider>
  );
}
