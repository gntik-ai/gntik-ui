# Tasks

## 1. Implementation

- [x] 1.1 Add LogoCloud, types, metadata, neutral currentColor fixtures, examples and exports.
- [x] 1.2 Add English and Spanish caption catalog entries.

## 2. Tests

- [x] 2.1 Test caption/list/image semantics, localization, grid columns, row wrapping classes, caption placement, sizing, overrides, static styling and empty input.
- [x] 2.2 Run jsdom axe on every example in all three themes; add browser colour, sizing, geometry and motion checks for PR CI.
- [x] 2.3 Cover documented props and live preview loaders in preview-catalog.test.mjs.

## 3. Docs and release

- [x] 3.1 Add live gallery previews and document single-colour SVG preparation, contrast overrides and empty input.
- [x] 3.2 Record minor blocks/ui releases in one changeset.
- [x] 3.3 Regenerate registry output and run bounded checks and strict OpenSpec validation. Browser suites run in PR CI; the offline tokens mirror test cannot find its pinned tarball here.
