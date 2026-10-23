## Purpose

Theme selectors of @gntik-ai/tokens that let any element re-apply the light, dark or high-contrast theme to its subtree with the frozen token values and the matching color-scheme.

## ADDED Requirements

### Requirement: Light selector repeats the frozen root values

scope.css SHALL declare a `.light` selector whose custom properties equal the `:root` colour, shadow and pairing-alias values of brand.css and pairing.css; brand.css MUST stay unchanged.

#### Scenario: Light island in a dark page

- **GIVEN** `<html>` has the class `dark`
- **WHEN** an element inside the page has the class `light`
- **THEN** its computed `--background` is `78 28% 96%`
- **AND** its computed `--primary-text` is `153 55% 22%`

#### Scenario: Values stay frozen

- **WHEN** the scope generator runs
- **THEN** every `.light` value equals the `:root` value in frozen-values.json
- **AND** brand.css is byte-identical

### Requirement: Each theme selector declares its color-scheme

scope.css SHALL set `color-scheme: light` on `.light` and `color-scheme: dark` on `.dark` and `.high_contrast`, so native controls inside a nested region follow that region's theme.

#### Scenario: Native control in a dark island

- **GIVEN** a page in the light theme
- **WHEN** an element with the class `dark` contains a native date input
- **THEN** the input computes `color-scheme: dark`
