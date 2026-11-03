## Purpose

Public entry points of `@gntik-ai/ui`: the root, the server-safe theme script, the forms adapter and the hooks subpath, with what each exports and how bundlers and agents find it.

## ADDED Requirements

### Requirement: Hooks subpath exports client hooks that the root also exports

The ui package SHALL publish `@gntik-ai/ui/hooks` with types and an ESM build that starts with the `'use client'` banner, and every name it exports SHALL also be exported from `@gntik-ai/ui`.

#### Scenario: Import from the subpath

- **WHEN** an app imports `useFitCount` from `@gntik-ai/ui/hooks`
- **THEN** the import resolves to `dist/hooks.js` with types from `dist/hooks.d.ts`
- **AND** `useFitCount` is also importable from `@gntik-ai/ui`

### Requirement: Hooks share one module instance across entries

A hook imported from `@gntik-ai/ui/hooks` MUST be the same function as the one imported from `@gntik-ai/ui` and MUST read the same React contexts.

#### Scenario: Toast from the subpath

- **GIVEN** a `ToastProvider` imported from `@gntik-ai/ui` wraps the app
- **WHEN** a component calls `useToast` imported from `@gntik-ai/ui/hooks` and adds a toast
- **THEN** the toast appears in the provider's Toaster

### Requirement: Hooks are safe to import and render on the server

Every hook in the entry SHALL avoid DOM access at import and during render and SHALL return its documented server value, so that rendering its example with `renderToString` MUST NOT throw.

#### Scenario: Server render of an example

- **WHEN** the example of each hook is rendered with `renderToString` in a test without `window`
- **THEN** no error is thrown
- **AND** the output matches the `server` value in the hook's doc

### Requirement: Every hook in the entry has a HookDoc and a docs page

Each hook exported from `packages/ui/src/hooks/index.ts` SHALL have a `HookDoc` with name, status, description, signature and server behaviour, and the docs site SHALL show a page per hook built from it.

#### Scenario: Missing doc

- **WHEN** a hook is added to the index without a `.doc.ts` file
- **THEN** the doc-coverage test fails and names the hook

### Requirement: Registry lists the hooks without a new item kind

The kit registry SHALL describe `packages/ui/src/hooks` as the `ui-hooks` item of kind `component` and group `Hooks`, so CLI and MCP versions that accept only the existing four kinds still read it.

#### Scenario: Search for hooks

- **WHEN** a user runs `gntik-ui search hook --json`
- **THEN** the result includes the `ui-hooks` item
- **AND** no unknown-kind error is raised
