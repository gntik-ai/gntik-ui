# Tasks

## 1. Implementation

- [x] 1.1 Add SearchableSelect, typed options/groups/actions, variants, public exports and docs.
- [x] 1.2 Add additive ComboboxTrigger, ComboboxPopupInput and content header/footer slots in both rendering paths.
- [x] 1.3 Add en/es selected-count and example messages.
- [x] 1.4 Rebuild WorkspaceSearch on the picker while preserving workspace presentation and matching.
- [x] 1.5 Add field, toolbar multiple, grouped regions, 5,000-option and action examples plus composable Combobox popup search.

## 2. Tests

- [x] 2.1 Test keyboard, focus, filtering, groups, empty states, single/multiple, actions, forms, disabled/readOnly, object keys and virtualization.
- [x] 2.2 Keep WorkspaceSwitcher tests unchanged.
- [x] 2.3 Cover Combobox trigger/header/filtering/footer and structural axe on all new/changed examples in all themes.
- [ ] 2.4 Browser accessibility/contrast and visual checks run in PR CI.

## 3. Docs and release

- [x] 3.1 Add keyboard and which-picker tables plus a minor @gntik-ai/ui changeset.
- [x] 3.2 Regenerate registry and run bounded library, lint, typecheck, registry, kit-only and docs coverage checks. The tokens mirror-install check cannot complete without network: its fallback packs local version 0.3.0 but reads a 0.2.1 tarball (ENOENT). Run the other library suites separately; PR CI covers the mirror install.
- [x] 3.3 Run openspec validate add-ui-searchable-select --strict.

## 4. Checker follow-up

- [x] 4.1 Reproduce the Portal guard failure with `pnpm --filter @gntik-ai/ui test src/utils/portal-coverage.test.ts` (18 actual portals against a floor of 19). Update the floor to 18: WorkspaceSearch now uses the shared ComboboxContent Portal. Keep every portal's scope-container assertions.
- [x] 4.2 Move SearchableSelect messages into a typed en/es catalog module and remove the unused `searchableSelect.examples.unavailable` key. Both main catalogs are below 1,000 lines.
- [x] 4.3 Regenerate registry sources so copied components include the split catalog; retain the existing minor UI changeset.
