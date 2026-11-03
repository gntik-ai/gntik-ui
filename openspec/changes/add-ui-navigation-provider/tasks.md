# Tasks

## 1. Implementation

- [x] 1.1 Add packages/ui/src/navigation/ (`NavRoute`, `navFromRoutes`, `getActivePage`, `NavigationProvider`, `useNavigation`, `useActivePage`, `useDocumentTitle`, doc and example) and export it from packages/ui/src/index.ts and, for `useDocumentTitle`, packages/ui/src/hooks/index.ts.
- [x] 1.2 Reuse matchesNavPath, matchesNavPattern and resolveCurrentNavItem; add `extractNavParams` beside them.
- [x] 1.3 Make packages/templates/src/shared/ConsoleShell.tsx fall back to `useNavigation()` for omitted `nav`, `currentHref` and `breadcrumbs`.
- [x] 1.4 Add the route-tree example and the Next.js `documentTitle={false}` note to the docs; add en and es copy.

## 2. Tests

- [x] 2.1 navigation.test.ts for menu flags, matching, params, `menuHref`, breadcrumbs and the unknown-path case, and navigation.ssr.test.tsx in a node environment.
- [x] 2.2 NavigationProvider.test.tsx for titles on pathname changes, `useDocumentTitle` override, restore and nesting, and `documentTitle={false}`.
- [x] 2.3 ConsoleShell.navigation.test.tsx for the derived nav and trail, explicit props, `breadcrumbs={null}` and the unchanged no-provider output.
- [x] 2.4 Example tests with axe in dark, light and high_contrast.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui` and `@gntik-ai/templates`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-ui-navigation-provider --strict`.
- [ ] 3.4 Verify the docs axe suites in PR CI (browser suites are excluded on workers).

## Test seams and red evidence

Seams: the pure helpers `navFromRoutes` and `getActivePage` (inputs and outputs, also in Node), the provider's effect on `document.title` through rendering and rerendering, `useDocumentTitle` through mounted and unmounted pages, and ConsoleShell's rendered DOM with and without a provider. Nothing internal is mocked. Each file failed first on the missing module or the missing ConsoleShell fallback (derived sidebar link and trail absent), then passed after its slice.
