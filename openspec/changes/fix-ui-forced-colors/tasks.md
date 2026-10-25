# Tasks

## 1. Implementation

- [x] 1.1 Add scoped system colours to Switch, RadioGroup and Tabs variants.
- [x] 1.2 Add fill and track fallbacks to Progress, Meter, Slider, Separator and StatusDot.
- [x] 1.3 Add system selection colours to Table, ToggleGroup, Calendar, Select, Menu, Combobox, CommandPalette, VirtualList and TransferList.
- [x] 1.4 Document the forced-colours rule in CONTRIBUTING.md.

## 2. Tests

- [x] 2.0 Reproduce missing mappings with failing unit tests before fixing each variant seam.
- [x] 2.1 Write forced-colours Playwright coverage for the live Library examples.
- [ ] 2.2 Run browser colour, visual and axe checks in PR CI (unavailable on the worker).
- [x] 2.3 Keep downstream ordinary-colour DOM fixtures pinned while normalizing only forced-colour classes.

## 3. Docs and release

- [x] 3.1 Add a patch changeset for `@gntik-ai/ui`.
- [x] 3.2 Regenerate the registry output.
- [x] 3.3 Complete local toolchain checks and strict OpenSpec validation (offline token mirror installation is deferred to CI).
