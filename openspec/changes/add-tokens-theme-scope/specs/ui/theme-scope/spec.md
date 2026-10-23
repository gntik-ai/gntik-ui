## Purpose

ThemeScope component of @gntik-ai/ui: renders a subtree, and the overlays portalled from it, in a given theme without changing the page theme.

## ADDED Requirements

### Requirement: ThemeScope applies the theme class and reports it through useTheme

ThemeScope SHALL render its wrapper with the class of its `theme` and `data-theme-scope`, and `useTheme().resolved` inside it SHALL return that theme while `mode` and `setMode` keep referring to the page.

#### Scenario: Nested scopes

- **GIVEN** a page in the `high_contrast` theme
- **AND** a light ThemeScope containing a dark ThemeScope
- **WHEN** a component inside the inner scope calls `useTheme()`
- **THEN** `resolved` is `dark`
- **AND** `mode` is the page mode

### Requirement: Overlays opened in a scope portal into a themed container

Inside a ThemeScope, kit overlays SHALL portal into a body-level container that carries the scope's theme class, and an explicit `container` prop SHALL take precedence. Outside a scope overlays MUST portal to `document.body`, and the scope's container SHALL be removed when the scope unmounts.

#### Scenario: Select in a light scope

- **GIVEN** a light ThemeScope inside a dark page
- **WHEN** a Select inside the scope is opened
- **THEN** the listbox is inside `div.light[data-theme-scope-portal]`
- **AND** the listbox uses the light popover colours

#### Scenario: Menu outside any scope

- **WHEN** a Menu outside any ThemeScope is opened
- **THEN** its popup is portalled to `document.body` as on origin/main

#### Scenario: Scope unmounts

- **WHEN** the ThemeScope unmounts
- **THEN** its portal container is removed from `document.body`
