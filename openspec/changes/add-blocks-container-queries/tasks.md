# Tasks

## 1. Implementation

- [x] 1.1 Add KpiRow and ResourceCardGrid container wrappers, optional containerClassName and literal column maps.
- [x] 1.2 Switch strip dividers, PageHeader folding, FormSection layout/default fields and ChartCard padding to container variants.
- [x] 1.3 Add five docked panel examples, a standard-frame composition, API docs for the new wrapper props and contribution guidance.

## 2. Tests

- [x] 2.1 Observe failing React tests before preserving list styling and section layout placement.
- [x] 2.2 Add one focused browser spec measuring columns, borders, actions, field positions, padding, the standard frame and flex sizing.
- [x] 2.3 Include axe checks over all five examples in all three themes.
- [ ] 2.4 Run browser measurements and confirm old viewport variants fail: the focused spec was attempted on the worker but the preview server cannot bind its socket (`listen EPERM ::1:4173`). Browser measurements, old-variant confirmation and axe remain for PR CI.
- [ ] 2.5 Review visual changes in PR CI; theme-builder--dark is an expected candidate for operator baseline refresh. No screenshots committed.

## 3. Docs and release

- [x] 3.1 Add a minor @gntik-ai/blocks changeset with wrapper/override compatibility guidance.
- [x] 3.2 Regenerate registry and record bounded library, docs and repository gate results and limits.
- [x] 3.3 Run strict OpenSpec validation.

## Worker validation limits

The initial attempt's library unit gate stopped in the unchanged tokens
mirror-install test before reaching the templates suite. The follow-up reproduced
four template failures with `pnpm --filter @gntik-ai/templates test src/resource-detail/Page.default.test.tsx src/settings-profile/Baseline.test.tsx src/settings-profile/Editable.test.tsx`.
The pinned markup omitted the intended PageHeader container classes and
FormSection inner grid. Only those changes were reconciled in the two fixtures.
The FormSection browser assertion now measures the Input wrapper, whose border
and padding surround the narrower native input.

Library builds, lint, typecheck, preview-catalog, docs-coverage, registry:check,
strict OpenSpec validation and both consumer kit-only checks pass on the worker.
The library unit gate still stops at the tokens mirror-install test: the public
registry is unavailable, and its offline fallback looks for a missing 0.2.1
tarball after packing the current 0.3.0 package (ENOENT). The downstream suites
are therefore run separately. All 1210 blocks tests and 538 templates tests pass,
including the four template regressions. The remaining downstream suites
(ui, charts, chat, editor and flow) also pass.

The focused browser spec loads and lists 26 tests, but execution cannot start
because the preview server's socket bind is denied. Browser layout, old-viewport
negative confirmation, axe and visual checks remain for PR CI. No visual
baselines are updated on the worker.
