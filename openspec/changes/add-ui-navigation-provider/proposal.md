# Change: Add NavigationProvider, route-tree helpers and useDocumentTitle

## Why

Pages pass navigation pieces by hand: ConsoleShell takes `nav`, `currentHref` and `breadcrumbs` separately, so sidebar, breadcrumbs and titles drift apart. No package sets `document.title`, so every route of an app shares one title (WCAG 2.4.2 Page Titled). `NavItem` has no menu-visibility flags. `add-nav-list-route-prefix-matching` already provides the path and pattern matching these helpers reuse.

## What changes

- Add `packages/ui/src/navigation/` exported from `@gntik-ai/ui`: `NavRoute`, `ActivePage`, `navFromRoutes`, `getActivePage`, `NavigationProvider`, `useNavigation`, `useActivePage` and `useDocumentTitle`. `useDocumentTitle` is also listed in `@gntik-ai/ui/hooks`.
- `navFromRoutes` builds NavList groups from a route tree and honours `hideInMenu`, `hideChildrenInMenu` and `flatMenu`. `getActivePage` resolves a pathname with NavList's rules (exact first, then the longest prefix or pattern at a segment boundary), fills `params`, builds breadcrumbs and selects the nearest menu-visible ancestor (`menuHref`). External (`target: '_blank'`) routes never become active.
- `NavigationProvider` takes the pathname from the app's router and writes `document.title` in an effect (`<page><separator><appTitle>`); `documentTitle={false}` leaves titles to the framework.
- `ConsoleShell` derives an omitted `nav`, `currentHref` or `breadcrumbs` from the provider; explicit props win and its output outside a provider is unchanged.
- Add `extractNavParams` next to `matchesNavPattern`, a catalog example, hook docs, en/es copy, one minor changeset (`@gntik-ai/ui`, `@gntik-ai/templates`) and the regenerated registry output.

## Scope and risk

Issue #132, risk R1. Additive and opt-in; rollback is a revert or a previous release pin. Out of scope: routing itself, scoped project nav sets, route-change announcements, `breadcrumbsFromNav` and a locale-aware title order (default `Page · App`, separator as a prop). In Next.js the framework's metadata can also set titles: use `documentTitle={false}` there. `target: '_blank'` is a route flag only; NavItem keeps its shape. No deployment, publication or dependency changes.
