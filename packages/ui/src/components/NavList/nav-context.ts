import { createContext, useContext, type ComponentType, type MouseEvent, type ReactNode } from 'react';

export type NavIcon = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;
export type NavMatch = 'exact' | 'prefix';

/** Path-only comparison for opt-in matching; exact matching deliberately skips normalization. */
function navPath(href: string): string {
  const path = href.split(/[?#]/, 1)[0] ?? '';
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function matchesNavPath(href: string, currentHref: string, match: NavMatch = 'exact'): boolean {
  if (match === 'exact') return href === currentHref;
  const path = navPath(currentHref);
  const target = navPath(href);
  return path === target || (target !== '/' && path.startsWith(`${target}/`));
}

function navSegments(href: string): string[] {
  const path = navPath(href);
  if (path === '/') return [];
  return (path.startsWith('/') ? path.slice(1) : path).split('/');
}

/** Minimal segment patterns, with no interpretation of regular expressions or URLPattern syntax. */
export function matchesNavPattern(pattern: string, currentHref: string): boolean {
  const segments = navSegments(pattern);
  const path = navSegments(currentHref);
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    if (segment === '*' && i === segments.length - 1) return true;
    const value = path[i];
    if (value === undefined) return false;
    if (segment.startsWith(':') && segment.length > 1) {
      if (!value) return false;
    } else if (segment !== value) return false;
  }
  return segments.length === path.length;
}

export interface NavItem {
  /** Stable key; defaults to `href`, then `label`. */
  id?: string;
  label: string;
  /** Destination. Rendered through the LinkProvider's router link when one is set. Without it the item is a button. */
  href?: string;
  /** Overrides the list's default (exact). Prefix matching compares normalized paths at segment boundaries. */
  match?: NavMatch;
  /** Additional path patterns: :name matches one segment; a final * matches the remaining segments. */
  pattern?: string | readonly string[];
  icon?: NavIcon;
  /** Count or short tag on the right (a dot in the collapsed rail). */
  badge?: ReactNode;
  /** Overrides computed matching for this item. Any true flag suppresses the computed winner. */
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
  /** The resolved item's identity is its key, so equal hrefs in different groups cannot collide. */
  currentKey?: NavItem;
  onNavigate?: (item: NavItem) => void;
}

export const NavContext = createContext<NavContextValue>({ collapsed: false });
export const useNavListContext = () => useContext(NavContext);

function matchingSegments(item: NavItem, currentHref: string, match: NavMatch): number {
  let score =
    item.href !== undefined && matchesNavPath(item.href, currentHref, item.match ?? match)
      ? navSegments(item.href).length
      : -1;
  const patterns = typeof item.pattern === 'string' ? [item.pattern] : (item.pattern ?? []);
  for (const pattern of patterns) {
    if (matchesNavPattern(pattern, currentHref)) score = Math.max(score, navSegments(pattern).length);
  }
  return score;
}

export function isNavItemCurrent(item: NavItem, currentHref?: string, match: NavMatch = 'exact'): boolean {
  return item.current ?? (currentHref !== undefined && matchingSegments(item, currentHref, match) >= 0);
}

function* walkNavItems(items: NavItem[]): Generator<NavItem> {
  for (const item of items) {
    yield item;
    if (item.items) yield* walkNavItems(item.items);
  }
}

/** Returns only the computed winner. Explicit current flags are applied by the rendering caller. */
export function resolveCurrentNavItem(
  groups: NavGroup[],
  currentHref?: string,
  match: NavMatch = 'exact',
): NavItem | undefined {
  if (currentHref === undefined) return undefined;
  let winner: NavItem | undefined;
  let winnerExact = false;
  let winnerScore = -1;
  for (const group of groups) {
    for (const item of walkNavItems(group.items)) {
      if (item.current === true) return undefined;
      if (item.current === false) continue;
      const score = matchingSegments(item, currentHref, match);
      if (score < 0) continue;
      const exact = item.href === currentHref;
      if ((exact && !winnerExact) || (!exact && !winnerExact && score > winnerScore)) {
        winner = item;
        winnerExact = exact;
        winnerScore = score;
      }
    }
  }
  return winner;
}

export function navItemContainsCurrent(item: NavItem, currentKey?: NavItem): boolean {
  return (item.items ?? []).some(
    (child) => isResolvedNavItemCurrent(child, currentKey) || navItemContainsCurrent(child, currentKey),
  );
}

export const navItemKey = (item: NavItem) => item.id ?? item.href ?? item.label;

export function isResolvedNavItemCurrent(item: NavItem, currentKey?: NavItem): boolean {
  return item.current ?? item === currentKey;
}
