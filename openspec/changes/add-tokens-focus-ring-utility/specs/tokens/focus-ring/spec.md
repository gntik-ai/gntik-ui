## Purpose

The kit's keyboard focus indicator: a token-coloured outline exposed as Tailwind utilities, contrast-tested in every theme.

## ADDED Requirements

### Requirement: Focus-ring utility draws the brand outline on keyboard focus

The focus-ring utility SHALL draw a 2px solid outline in var(--color-focus-ring) with a 2px offset only when the element matches :focus-visible. It MUST NOT draw an outline on pointer focus.

#### Scenario: Tab to a button

- **GIVEN** buttons with focus-ring and the legacy three-class outline in dark, light or high_contrast
- **WHEN** the user tabs to each button
- **THEN** their computed outline-style, outline-width, outline-color and outline-offset are equal
- **AND** the outline is solid, 2px wide and offset by 2px

#### Scenario: Click a button

- **WHEN** the user clicks either button from pointer focus
- **THEN** no outline is shown

#### Scenario: Focus inside a nested theme scope

- **GIVEN** a focus-ring button inside a light scope on a dark page
- **WHEN** the user tabs to it
- **THEN** the outline uses the local scope's focus colour

### Requirement: Inset focus ring stays inside flush items

The focus-ring-inset utility SHALL draw the same keyboard outline with a -2px offset, keeping the entire outline inside the element's border box.

#### Scenario: Clipped list row

- **GIVEN** a row with focus-ring-inset in an overflow-hidden list
- **WHEN** the row receives keyboard focus
- **THEN** its computed outline-offset is -2px and the entire outline stays inside the row and clipping container

### Requirement: Lint reports hand-written focus strings

Brand lint MUST report the legacy three-class string within a single Literal or TemplateElement in component-package TypeScript source, with a message naming focus-ring. Explicit has-, focus-within, group- and peer-keyed outlines and nonstandard offsets SHALL remain permitted.

#### Scenario: New component

- **WHEN** a component adds the legacy three-class focus string
- **THEN** pnpm lint fails with a message naming focus-ring

#### Scenario: Mechanical migration

- **WHEN** package source and class expectations are scanned
- **THEN** no exact legacy three-class string remains
- **AND** DOM and class snapshots differ only by the class substitution

### Requirement: Release preserves existing token values

The change SHALL preserve frozen token values and existing catalog visual baselines, regenerate registry artifacts and record a tokens minor plus patches for other changed published packages.

#### Scenario: Consumer copies migrated source

- **WHEN** a consumer copies a migrated registry item
- **THEN** documentation directs them to upgrade tokens to the minor release introducing focus-ring
- **AND** no third-party focus styling or forced-colours rules change
