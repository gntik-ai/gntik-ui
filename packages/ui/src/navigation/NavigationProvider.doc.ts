import type { ComponentDoc } from '../doc';

/** Catalog documentation for the navigation provider and its pure helpers. */
export const doc: ComponentDoc = {
  name: 'NavigationProvider',
  group: 'Navigation',
  status: 'beta',
  description:
    "One route tree for the sidebar groups, the active page, the breadcrumb trail and the document title, independent of the router. A NavRoute has a path (NavItem.pattern syntax: /functions/:id, /projects/:id/*), a title (a string or a function of the params), optional icon, badge, group, children, match and the flags hideInMenu, hideChildrenInMenu, flatMenu, hideInBreadcrumb and target: '_blank'. navFromRoutes(routes) returns NavList groups in route order, labelled by each top-level route's group; hidden routes are left out and flatMenu children take their parent's place. getActivePage(routes, pathname, { home }) resolves the pathname with NavList's rules (exact path first, then the longest prefix or pattern at a segment boundary, query and hash ignored; external routes never match) and returns { route, title, path, params, breadcrumbs, menuHref } or null. menuHref is the nearest route visible in the menu, so /functions/fn-42 keeps Functions current. NavigationProvider({ routes, pathname, appTitle, titleSeparator = ' · ', documentTitle = true, home }) takes the pathname from your router, exposes useNavigation() ({ routes, groups, pathname, activePage }, or null outside a provider) and useActivePage(), and writes document.title as '<page><separator><appTitle>' in an effect after each pathname change ('<appTitle>' alone when no route matches). useDocumentTitle(title) overrides it while a page is mounted. Inside a provider, ConsoleShell derives nav, currentHref and breadcrumbs when you omit them; explicit props, including breadcrumbs={null}, win. In Next.js pass documentTitle={false} when route metadata sets titles, so the two do not fight on client navigation. The helpers are pure and run in Node; links render through LinkProvider.",
  anatomy:
    '<NavigationProvider routes={routes} pathname={usePathname()} appTitle="Console"><ConsoleShell>…</ConsoleShell></NavigationProvider>',
};
