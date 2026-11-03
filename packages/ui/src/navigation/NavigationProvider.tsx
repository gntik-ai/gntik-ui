import { createContext, useContext, useEffect, useInsertionEffect, useMemo, useRef, type ReactNode } from 'react';
import type { BreadcrumbItem } from '../components/Breadcrumbs/Breadcrumbs';
import type { NavGroup } from '../components/NavList/nav-context';
import { getActivePage, navFromRoutes, type ActivePage, type NavRoute } from './route-tree';
import { TitleOverridesContext, type TitleOverrides } from './title-context';

/** What `useNavigation()` returns inside a NavigationProvider. */
export interface NavigationValue {
  routes: readonly NavRoute[];
  /** The sidebar groups for NavList, derived from `routes`. */
  groups: NavGroup[];
  /** The pathname the provider was given, as is. */
  pathname: string;
  /** The route the pathname resolves to; `null` when none matches. */
  activePage: ActivePage | null;
}

export interface NavigationProviderProps {
  /** The app's route tree. */
  routes: readonly NavRoute[];
  /** The current location's pathname from your router (`useLocation().pathname`, `usePathname()`). Query and hash are ignored. */
  pathname: string;
  /** Name of the app; the document title is `<page><separator><appTitle>`, or just `appTitle` when no route matches. */
  appTitle?: string;
  /** Between the page title and `appTitle`. Defaults to ` · `. */
  titleSeparator?: string;
  /** Set to false to leave `document.title` to the framework (e.g. Next.js metadata). Defaults to true. */
  documentTitle?: boolean;
  /** Prepended to every active page's breadcrumbs. */
  home?: BreadcrumbItem;
  children?: ReactNode;
}

const NavigationContext = createContext<NavigationValue | null>(null);

/**
 * The navigation state of the provider above, or `null` outside one. ConsoleShell uses the `null`
 * to keep its own defaults when no provider is present.
 */
export function useNavigation(): NavigationValue | null {
  return useContext(NavigationContext);
}

/** The active page of the provider above; `null` outside a provider or when no route matches. */
export function useActivePage(): ActivePage | null {
  return useContext(NavigationContext)?.activePage ?? null;
}

interface TitleSettings {
  pageTitle: string | undefined;
  appTitle: string | undefined;
  separator: string;
  enabled: boolean;
}

function composeTitle(page: string | undefined, appTitle: string | undefined, separator: string) {
  if (page && appTitle) return `${page}${separator}${appTitle}`;
  return page || appTitle || undefined;
}

/** Write the highest-ranked (innermost) override, or the route title, to `document.title`. Effects and handlers only. */
function writeTitle(settings: TitleSettings | null, overrides: ReadonlyMap<object, { rank: number; title: string }>) {
  if (!settings?.enabled || typeof document === 'undefined') return;
  let top: { rank: number; title: string } | undefined;
  for (const entry of overrides.values()) if (!top || entry.rank > top.rank) top = entry;
  const page = top ? top.title : settings.pageTitle;
  const next = composeTitle(page, settings.appTitle, settings.separator);
  if (next !== undefined && document.title !== next) document.title = next;
}

/**
 * One route tree for the app shell: derives the sidebar groups, the active page with its params and
 * breadcrumbs, and (unless `documentTitle={false}`) writes `document.title` after each pathname
 * change. It renders no element and reads no router: pass the pathname from your router. Links
 * still render through LinkProvider. Nothing touches `document` while rendering, so it is safe to
 * server-render; the title is written in an effect. In Next.js, pass `documentTitle={false}` when
 * route `metadata` already sets titles, so the two do not fight on client navigation.
 */
export function NavigationProvider({
  routes,
  pathname,
  appTitle,
  titleSeparator = ' · ',
  documentTitle = true,
  home,
  children,
}: NavigationProviderProps) {
  const groups = useMemo(() => navFromRoutes(routes), [routes]);
  const activePage = useMemo(() => getActivePage(routes, pathname, { home }), [routes, pathname, home]);
  const value = useMemo<NavigationValue>(
    () => ({ routes, groups, pathname, activePage }),
    [routes, groups, pathname, activePage],
  );

  const settings = useRef<TitleSettings | null>(null);
  const overrides = useRef(new Map<object, { rank: number; title: string }>());
  const ranks = useRef(0);

  const overridesApi = useMemo<TitleOverrides>(
    () => ({
      rank: () => ++ranks.current,
      set: (owner, rank, title) => {
        overrides.current.set(owner, { rank, title });
        writeTitle(settings.current, overrides.current);
      },
      remove: (owner) => {
        if (overrides.current.delete(owner)) writeTitle(settings.current, overrides.current);
      },
    }),
    [],
  );

  const pageTitle = activePage?.title;
  // Child effects (useDocumentTitle) run before this component's own, so the settings are refreshed
  // in an insertion effect: it only assigns a ref, runs before any passive effect and not on the server.
  useInsertionEffect(() => {
    settings.current = { pageTitle, appTitle, separator: titleSeparator, enabled: documentTitle };
  }, [pageTitle, appTitle, titleSeparator, documentTitle]);
  useEffect(() => {
    writeTitle(settings.current, overrides.current);
  }, [pageTitle, appTitle, titleSeparator, documentTitle]);

  return (
    <NavigationContext.Provider value={value}>
      <TitleOverridesContext.Provider value={overridesApi}>{children}</TitleOverridesContext.Provider>
    </NavigationContext.Provider>
  );
}
