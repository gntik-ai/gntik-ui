import { createContext, useContext, type ComponentType, type MouseEvent, type ReactNode } from 'react';

export type NavIcon = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface NavItem {
  /** Stable key; defaults to `href`, then `label`. */
  id?: string;
  label: string;
  /** Destination. Rendered through the LinkProvider's router link when one is set. Without it the item is a button. */
  href?: string;
  icon?: NavIcon;
  /** Count or short tag on the right (a dot in the collapsed rail). */
  badge?: ReactNode;
  /** Marks the item as the current page. Defaults to `href === currentHref`. */
  current?: boolean;
  disabled?: boolean;
  /** Nested sub-items: the item becomes a collapsible section (a flyout menu in the rail). */
  items?: NavItem[];
  /** Initial expansion of a nested section; defaults to open when it contains the current page. */
  defaultOpen?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface NavGroup {
  id?: string;
  /** Group heading (mono, uppercase). Also names the group's list. */
  label?: string;
  items: NavItem[];
  /** Turns the heading into a toggle that folds the group. */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface NavContextValue {
  collapsed: boolean;
  currentHref?: string;
  onNavigate?: (item: NavItem) => void;
}

export const NavContext = createContext<NavContextValue>({ collapsed: false });
export const useNavListContext = () => useContext(NavContext);

export function isNavItemCurrent(item: NavItem, currentHref?: string): boolean {
  return item.current ?? (currentHref !== undefined && item.href !== undefined && item.href === currentHref);
}

export function navItemContainsCurrent(item: NavItem, currentHref?: string): boolean {
  return (item.items ?? []).some((child) => isNavItemCurrent(child, currentHref) || navItemContainsCurrent(child, currentHref));
}

export const navItemKey = (item: NavItem) => item.id ?? item.href ?? item.label;
