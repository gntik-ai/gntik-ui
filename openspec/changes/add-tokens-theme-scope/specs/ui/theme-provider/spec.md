## Purpose

ThemeProvider of @gntik-ai/ui: applies the page theme class and color-scheme, persists the chosen mode and exposes the theme and brand preset to components.

## ADDED Requirements

### Requirement: Forced mode overrides the stored and system themes

When `forcedMode` is set, ThemeProvider SHALL apply that theme to its target regardless of the stored mode and the OS preference; `setMode` SHALL still store the choice, which MUST take effect only after `forcedMode` is unset.

#### Scenario: Forced light over a stored dark mode

- **GIVEN** `dark` is stored
- **WHEN** ThemeProvider renders with `forcedMode="light"`
- **THEN** `<html>` has no theme class and computes `color-scheme: light`
- **AND** `useTheme().resolved` is `light`

#### Scenario: Choosing a mode while forced

- **GIVEN** ThemeProvider renders with `forcedMode="light"`
- **WHEN** `setMode('high_contrast')` is called
- **THEN** `high_contrast` is stored
- **AND** the page stays light
