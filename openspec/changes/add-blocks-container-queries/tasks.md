# Tasks

## 1. Implementation

- [x] 1.1 Add KpiRow and ResourceCardGrid container wrappers, optional containerClassName and literal column maps.
- [x] 1.2 Switch strip dividers, PageHeader folding, FormSection layout/default fields and ChartCard padding to container variants.
- [x] 1.3 Add five docked panel examples, a standard-frame composition, API docs for the new wrapper props and contribution guidance.

## 2. Tests

- [x] 2.1 Observe failing React tests before preserving list styling and section layout placement.
- [x] 2.2 Add one focused browser spec measuring columns, borders, actions, field positions, padding, the standard frame and flex sizing.
- [x] 2.3 Include axe checks over all five examples in all three themes.
- [ ] 2.4 Run browser measurements and confirm old viewport variants fail: browser suites run in PR CI under the worker policy; the focused spec is included in the a11y suite.
- [ ] 2.5 Review visual changes in PR CI; theme-builder--dark is an expected candidate for operator baseline refresh. No screenshots committed.

## 3. Docs and release

- [x] 3.1 Add a minor @gntik-ai/blocks changeset with wrapper/override compatibility guidance.
- [x] 3.2 Regenerate registry and run bounded library, docs and repository gates.
- [x] 3.3 Run strict OpenSpec validation.

## Worker validation limits

The focused five-block unit run passes (22 tests), as do preview-catalog,
docs-coverage, library and docs builds, lint, typecheck, registry:check and both
consumer kit-only checks. The library unit gate stops in the unchanged tokens
mirror-install test: the public registry is unavailable, and its offline fallback
looks for a 0.2.1 tarball after packing the current 0.3.0 package (ENOENT).
The initial full blocks run passed 1208 tests and exposed two pinned PageHeader
HTML mismatches. Allowing only the three approved container-class changes in the
expected HTML preserves the original fixture; all six compatibility cases pass
after this correction.
Browser layout, axe and visual checks run in PR CI. No visual baselines are
updated on the worker.
