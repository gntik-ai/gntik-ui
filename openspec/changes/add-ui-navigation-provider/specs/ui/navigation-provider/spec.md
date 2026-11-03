## Purpose

Navigation registry for kit apps: one route tree that yields the sidebar groups, the active page with its params, the breadcrumb trail and the document title, independent of the router.

## ADDED Requirements

### Requirement: Route tree builds the sidebar groups with menu flags

`navFromRoutes(routes)` SHALL return NavList groups in route order, labelled by each top-level route's `group`, and SHALL leave out `hideInMenu` routes and `hideChildrenInMenu` children and lift `flatMenu` children to their parent's level.

#### Scenario: Hidden detail route

- **GIVEN** a `Functions` route at `/functions` with a child `/functions/:id` and `hideChildrenInMenu`
- **WHEN** `navFromRoutes` runs
- **THEN** the Functions item has no nested items

#### Scenario: Flat menu

- **GIVEN** a route with `flatMenu` and children `Logs` and `Traces`
- **WHEN** `navFromRoutes` runs
- **THEN** Logs and Traces appear at the parent's level and the parent itself does not

### Requirement: Active page resolves from the pathname and selects a visible menu item

`getActivePage(routes, pathname)` SHALL pick the exact path first, then the longest prefix or pattern match at a segment boundary, ignoring query and hash, SHALL fill `params` and SHALL set `menuHref` to the nearest ancestor visible in the menu; external routes MUST NOT become active.

#### Scenario: Detail page keeps its section current

- **WHEN** `getActivePage` runs for `/functions/fn-42?tab=logs`
- **THEN** the active route is `/functions/:id` with params `{ id: 'fn-42' }`
- **AND** `menuHref` is `/functions`

#### Scenario: Segment boundary

- **WHEN** `getActivePage` runs for `/functions-v2`
- **THEN** the `/functions` route is not active
- **AND** an unknown path returns `null`

### Requirement: Breadcrumbs follow the active route's ancestors

The active page's `breadcrumbs` SHALL list the ancestors from the root with their titles and concrete paths, end with the active page without `href`, skip `hideInBreadcrumb` routes and start with the provider's `home` item when given.

#### Scenario: Trail for a detail page

- **GIVEN** `home` is `{ label: 'Home', href: '/' }`
- **WHEN** the pathname is `/functions/fn-42`
- **THEN** the breadcrumbs are Home (`/`), Functions (`/functions`) and `fn-42` without `href`

### Requirement: Document title follows the active page

Unless `documentTitle` is false, NavigationProvider SHALL set `document.title` after each pathname change to the page title, the separator and `appTitle`, or to `appTitle` alone when nothing matches; `useDocumentTitle(title)` SHALL override it while mounted and restore the route title on unmount. Nothing SHALL read or write `document` while rendering.

#### Scenario: Route change

- **GIVEN** `appTitle` is `Console`
- **WHEN** the pathname changes from `/functions` to `/functions/fn-42`
- **THEN** `document.title` changes from `Functions · Console` to `fn-42 · Console`

#### Scenario: Page override

- **WHEN** a page calls `useDocumentTitle('Edit fn-42')` and later unmounts
- **THEN** the title is `Edit fn-42 · Console` while mounted
- **AND** it returns to `fn-42 · Console` after unmount

#### Scenario: Framework-owned titles

- **WHEN** `documentTitle={false}` is set
- **THEN** `document.title` is never written

### Requirement: ConsoleShell falls back to the navigation context

Inside a NavigationProvider, ConsoleShell SHALL use the provider's groups, active menu item and breadcrumbs for any of `nav`, `currentHref` and `breadcrumbs` that is omitted; explicit props, including `breadcrumbs={null}`, MUST win and output outside a provider MUST NOT change.

#### Scenario: Derived shell

- **GIVEN** a NavigationProvider at `/functions/fn-42`
- **WHEN** ConsoleShell renders without `nav`, `currentHref` or `breadcrumbs`
- **THEN** the sidebar marks Functions as the current page
- **AND** the topbar shows the Functions › fn-42 trail
