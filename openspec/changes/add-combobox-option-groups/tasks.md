# Tasks

## 1. Implementation

- [x] 1.1 Add and export Combobox group, label, separator, collection and filter hook parts; share Select styles.
- [x] 1.2 Preserve grouped async/creatable collections, filter within groups and match exact labels across groups. Keep special rows outside labelled groups.
- [x] 1.3 Add MultiSelectOption.group, first-seen group rendering and select all across enabled options. Preserve flat DOM and full grouped rendering.

## 2. Tests

- [x] 2.1 Exercise group names, keyboard boundaries, filtering, empty state and flat DOM through public component APIs.
- [x] 2.2 Exercise grouped async loading, debounce, stale abort, Retry and creatable placement/exact matching.
- [x] 2.3 Exercise MultiSelect ordering, filtering, disabled/select-all behavior and grouped creation.
- [x] 2.4 Add three-theme unit axe checks and a browser axe spec covering both live examples. Browser suites run in PR CI.

## 3. Docs and release

- [x] 3.1 Add ComboboxGrouped and MultiSelectGrouped live examples and update component docs.
- [x] 3.2 Add one minor changeset for @gntik-ai/ui and regenerate the registry and llms output.
- [x] 3.3 Run bounded repository checks and strict OpenSpec validation.
- [ ] 3.4 Run browser axe checks in PR CI.

## Worker validation

Library build, lint, workspace typecheck, registry freshness, docs coverage, both kit-only checks and strict OpenSpec validation passed. All library unit suites except the network-dependent tokens mirror fixture completed successfully, including the grouped examples' unit axe checks in all three themes. Without registry access, that fixture's offline setup expects gntik-ai-tokens-0.2.1.tgz after packing the current package and stops with ENOENT before testing installation. Browser suites run in PR CI; no browser suite was launched on the worker.
