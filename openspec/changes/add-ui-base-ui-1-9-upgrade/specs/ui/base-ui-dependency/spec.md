## Purpose

The Base UI version used by the kit and the interaction, accessibility and release gates for its upgrade.

## ADDED Requirements

### Requirement: Workspace consumers resolve Base UI 1.9.0 with a baseline exception

`@gntik-ai/ui` SHALL declare `@base-ui/react` at `^1.9.0`. Every workspace package and app using Base UI directly or through the workspace UI package MUST resolve 1.9.0. The only 1.8.x copy permitted in the lockfile SHALL be the transitive dependency of the unchanged `@gntik-ai/ui-baseline` and `@gntik-ai/blocks-baseline` aliases at published 0.5.0. No overrides or resolutions SHALL force either version.

#### Scenario: Lockfile after dependency resolution

- **WHEN** the workspace lockfile is inspected
- **THEN** workspace UI resolves Base UI 1.9.0 and utils 0.5.0
- **AND** Base UI 1.8.0 and utils 0.4.0 occur only for the published docs baseline dependency chain
- **AND** both baseline aliases remain at 0.5.0 with no overrides or resolutions

### Requirement: Visible labels and explicit accessible labels retain defined precedence

Checkbox, Switch and Radio with `label="Email me"` and no `aria-label` SHALL be named `Email me`. Adding `aria-label="Notify"` MUST name each control `Notify`. Their doc.ts files SHALL state that explicit aria-label takes precedence and both labels must remain consistent for WCAG 2.5.3. Live examples SHALL demonstrate consistent labels, using the en/es catalog for every new visible or accessible string.

#### Scenario: Visible label only

- **WHEN** each toggle control renders with label `Email me`
- **THEN** getByRole finds it with accessible name `Email me`

#### Scenario: Both labels

- **WHEN** each control also has aria-label `Notify`
- **THEN** getByRole finds it with accessible name `Notify`
- **AND** docs explain label precedence and label-in-name consistency

### Requirement: Overlapping interactions keep toast timers paused

A hovered toast SHALL remain paused when focus enters its close button. It MUST dismiss only after both hover and focus have left and its remaining timeout has passed.

#### Scenario: Hover then focus then leave

- **GIVEN** a toast with a finite timeout
- **WHEN** it is hovered, its close button receives focus, and the pointer leaves
- **THEN** it remains visible beyond its timeout while focus stays inside
- **WHEN** focus leaves and the remaining timeout passes
- **THEN** it dismisses

### Requirement: Late search results highlight the first match

CommandPalette and WorkspaceSearch SHALL highlight the first matching item that arrives after typing. Enter MUST select that item without extra navigation.

#### Scenario: Late results after a query

- **GIVEN** either search UI is open with no items
- **WHEN** the user types and matching items arrive later
- **THEN** the input's aria-activedescendant names the first highlighted option
- **AND** Enter selects it and closes the popup

### Requirement: Virtualized keyboard navigation preserves the existing contracts

The four named Combobox, MultiSelect and async Combobox regression tests MUST pass unchanged, including assertions and timeouts. Home SHALL highlight the first option, End the last, and PageDown/PageUp one viewport clamped to the ends. The highlighted row MUST remain mounted and be named by aria-activedescendant.

#### Scenario: Large virtualized collections

- **WHEN** the existing virtualized keyboard and async tests run on 1.9.0
- **THEN** the highlighted option stays mounted during scrolling and keyboard navigation
- **AND** full-list accessible positions, loading, retry and selection contracts remain unchanged

### Requirement: Swipe progress and nested Escape preserve overlay behavior

Drawer and BottomSheet swipes SHALL update the backdrop's `--drawer-swipe-progress`, retain the opacity calculation using that progress, remain open below the dismissal threshold and close beyond it. Escape MUST close only the top-most nested dialog and restore focus to its trigger.

#### Scenario: Swipe below and above the threshold

- **WHEN** either overlay is dragged partway toward dismissal
- **THEN** the backdrop progress reflects the drag and release below the threshold leaves it open
- **WHEN** the swipe passes the threshold
- **THEN** the overlay closes

#### Scenario: Nested dialogs

- **GIVEN** two open nested dialogs
- **WHEN** Escape is pressed once
- **THEN** only the inner dialog closes and its trigger receives focus
- **WHEN** Escape is pressed again
- **THEN** the outer dialog closes

### Requirement: The upgrade passes repository accessibility and release gates

Keyboard contracts and jsdom axe in UI, blocks, templates and chat SHALL pass. Browser axe MUST add no violations against a11y-baseline.json in dark, light or high_contrast; visual baselines MUST remain unchanged or be operator-refreshed with a reason. Changed expectations MUST trace to a 1.9 release-note line or, solely for internal markup, an old/new value and installed source line with names, roles, states, keyboard and axe unchanged. No test SHALL be removed, skipped, relaxed, retried or given extra timeout. Token-only styles and frozen brand values SHALL remain intact.

#### Scenario: Delivery gates

- **WHEN** library builds, lint, typecheck, library tests, docs coverage, registry freshness and strict OpenSpec validation run
- **THEN** they pass and a minor changeset for `@gntik-ai/ui` plus regenerated registry output are committed
- **AND** browser axe and visual checks run in PR CI
- **AND** physical touch, on-screen keyboard and Android back checks remain listed for the operator
