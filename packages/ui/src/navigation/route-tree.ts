import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '../components/Breadcrumbs/Breadcrumbs';
import {
  extractNavParams,
  navPath,
  resolveCurrentNavItem,
  type NavGroup,
  type NavIcon,
  type NavItem,
  type NavMatch,
} from '../components/NavList/nav-context';

/**
 * One route of the app's navigation tree. The same tree yields the sidebar groups
 * ({@link navFromRoutes}), the active page, its breadcrumbs and the document title
 * ({@link getActivePage}).
 */
export interface NavRoute {
  /**
   * Path of the route. Static paths (`/functions`) match by `match`; paths with `:name` segments or a
   * final `*` use the `NavItem.pattern` syntax (`/functions/:id`, `/projects/:id/*`).
   */
  path: string;
  /** Page title and menu label. A function receives the params of the active path. */
  title: string | ((params: Record<string, string>) => string);
  icon?: NavIcon;
  /** Count or short tag shown on the menu item. */
  badge?: ReactNode;
  /** Top-level routes only: the label of the sidebar group the route belongs to. */
  group?: string;
  children?: NavRoute[];
  /** How a static path matches the pathname; defaults to `exact`. Dynamic paths always match as patterns. */
  match?: NavMatch;
  /** Keep the route (and its children) out of the sidebar. It can still be the active page. */
  hideInMenu?: boolean;
  /** Keep the route's children out of the sidebar, e.g. detail pages. */
  hideChildrenInMenu?: boolean;
  /** Show the children at the route's own level and leave the route itself out of the sidebar. */
  flatMenu?: boolean;
  /** Leave the route out of the breadcrumb trail. */
  hideInBreadcrumb?: boolean;
  /** An external destination: never the active page. */
  target?: '_blank';
}

/** The page the pathname resolves to, with everything a shell needs to render around it. */
export interface ActivePage {
  /** The matched route. */
  route: NavRoute;
  /** The route's title for the matched params. */
  title: string;
  /** The pathname that matched, without query, hash or trailing slash. */
  path: string;
  /** Values of the route's `:name` segments, decoded. */
  params: Record<string, string>;
  /** Ancestors from the root with concrete paths, ending with this page without `href`. */
  breadcrumbs: BreadcrumbItem[];
  /** Href of the nearest route (this one included) that is visible in the menu, for the sidebar's current item. */
  menuHref?: string;
}

export interface GetActivePageOptions {
  /** Prepended to the breadcrumbs, e.g. a Home item. */
  home?: BreadcrumbItem;
}

const isDynamic = (path: string) => /(^|\/)[:*]/.test(path);

const resolveTitle = (route: NavRoute, params: Record<string, string>) =>
  typeof route.title === 'function' ? route.title(params) : route.title;

/** `/projects/:id/*` with `{ id: 'a b' }` becomes `/projects/a%20b`. */
function fillPath(path: string, params: Record<string, string>): string {
  const segments = path
    .split('/')
    .filter((segment, i, all) => segment !== '' && !(segment === '*' && i === all.length - 1))
    .map((segment) => {
      const value = segment.startsWith(':') && segment.length > 1 ? params[segment.slice(1)] : undefined;
      return value === undefined ? segment : encodeURIComponent(value);
    });
  return `/${segments.join('/')}`;
}

/**
 * Params of a route that is an ancestor (or the match) of `path`: the route's pattern is applied to
 * the leading segments of the pathname, so `/projects/:id` yields `{ id: 'acme' }` for
 * `/projects/acme/settings/details`.
 */
function routeParams(route: NavRoute, path: string): Record<string, string> {
  if (!isDynamic(route.path)) return {};
  const pattern = route.path.replace(/\/\*$/, '');
  const depth = pattern.split('/').filter(Boolean).length;
  const leading = `/${path.split('/').filter(Boolean).slice(0, depth).join('/')}`;
  return extractNavParams(pattern, leading);
}

function ancestorCrumb(ancestor: NavRoute, path: string): BreadcrumbItem {
  const params = routeParams(ancestor, path);
  return { label: resolveTitle(ancestor, params), href: fillPath(ancestor.path, params) };
}

interface Menu {
  groups: NavGroup[];
  /** Routes that appear as an item in the groups. */
  inMenu: Set<NavRoute>;
}

/** Menu labels are only resolved when `labelOf` is given; visibility alone never calls a title function. */
function menuItems(
  routes: readonly NavRoute[],
  inMenu: Set<NavRoute>,
  labelOf: (route: NavRoute) => string,
): NavItem[] {
  const items: NavItem[] = [];
  for (const route of routes) {
    if (route.hideInMenu) continue;
    const children = route.hideChildrenInMenu ? [] : (route.children ?? []);
    if (route.flatMenu) {
      items.push(...menuItems(children, inMenu, labelOf));
      continue;
    }
    const item: NavItem = { label: labelOf(route), href: route.path };
    if (route.match) item.match = route.match;
    if (isDynamic(route.path)) item.pattern = route.path;
    if (route.icon) item.icon = route.icon;
    if (route.badge !== undefined) item.badge = route.badge;
    const nested = menuItems(children, inMenu, labelOf);
    if (nested.length > 0) item.items = nested;
    inMenu.add(route);
    items.push(item);
  }
  return items;
}

function buildMenu(routes: readonly NavRoute[], labelOf: (route: NavRoute) => string): Menu {
  const inMenu = new Set<NavRoute>();
  const byGroup = new Map<string, NavGroup>();
  for (const route of routes) {
    const items = menuItems([route], inMenu, labelOf);
    if (items.length === 0) continue;
    const key = route.group ?? '';
    let group = byGroup.get(key);
    if (!group) {
      group = route.group === undefined ? { items: [] } : { label: route.group, items: [] };
      byGroup.set(key, group);
    }
    group.items.push(...items);
  }
  return { groups: [...byGroup.values()], inMenu };
}

/**
 * Sidebar groups for NavList from a route tree, in route order. Top-level routes are grouped by
 * `group` (routes without one share an unlabelled group). `hideInMenu` routes and the children of
 * `hideChildrenInMenu` routes are left out, and the children of a `flatMenu` route take its place
 * in its group. Pure and router-agnostic: safe in Node and during server rendering.
 */
export function navFromRoutes(routes: readonly NavRoute[]): NavGroup[] {
  return buildMenu(routes, (route) => resolveTitle(route, {})).groups;
}

interface Candidate {
  route: NavRoute;
  ancestors: NavRoute[];
}

function collect(routes: readonly NavRoute[], ancestors: NavRoute[], out: Map<NavItem, Candidate>): void {
  for (const route of routes) {
    if (route.target === '_blank') continue;
    const dynamic = isDynamic(route.path);
    const item: NavItem = { label: route.path };
    if (dynamic) item.pattern = route.path;
    else item.href = route.path;
    if (route.match) item.match = route.match;
    out.set(item, { route, ancestors });
    collect(route.children ?? [], [...ancestors, route], out);
  }
}

/**
 * Resolve the pathname to the active route with its title, params, breadcrumbs and menu item, or
 * `null` when no route matches. An exact path wins, then the longest prefix or pattern match at a
 * segment boundary (the rules of NavList's current-item resolution); query and hash are ignored and
 * external (`target: '_blank'`) routes never match. Pure and router-agnostic: safe in Node.
 */
export function getActivePage(
  routes: readonly NavRoute[],
  pathname: string,
  { home }: GetActivePageOptions = {},
): ActivePage | null {
  const path = navPath(pathname);
  const candidates = new Map<NavItem, Candidate>();
  collect(routes, [], candidates);
  const winner = resolveCurrentNavItem([{ items: [...candidates.keys()] }], path);
  const found = winner && candidates.get(winner);
  if (!found) return null;

  const { route, ancestors } = found;
  const params = routeParams(route, path);
  const title = resolveTitle(route, params);

  const trail: BreadcrumbItem[] = [];
  for (const ancestor of ancestors) {
    if (!ancestor.hideInBreadcrumb) trail.push(ancestorCrumb(ancestor, path));
  }
  if (!route.hideInBreadcrumb) trail.push({ label: title });

  const { inMenu } = buildMenu(routes, () => '');
  const menuRoute = [route, ...[...ancestors].reverse()].find((r) => inMenu.has(r));
  const page: ActivePage = {
    route,
    title,
    path,
    params,
    breadcrumbs: home ? [home, ...trail] : trail,
  };
  if (menuRoute) page.menuHref = fillPath(menuRoute.path, routeParams(menuRoute, path));
  return page;
}
