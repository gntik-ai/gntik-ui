## Purpose

Named stacking layers of @gntik-ai/tokens for in-component lifts, sticky bars, dropdowns, overlays, modals, popovers, toasts and tooltips, as CSS variables and z-<layer> utilities.

## ADDED Requirements

### Requirement: Layers are ordered and bridged to utilities

layers.css SHALL declare behind -1, base 0, raised 1, sticky 10, sticky-pinned 11, docked 20, dropdown 1000, overlay 1300, modal 1400, popover 1500, skip-link 1600, toast 1700 and tooltip 1800, in that strictly increasing order. tailwind.css SHALL expose each one as a static z-<layer> utility that sets z-index: var(--z-<layer>). The layers SHALL be exported in tokens.json as zIndex number tokens and as identical zIndex constants in tokens.ts, tokens.js and tokens.d.ts. Existing token values and figma-variables.json SHALL remain unchanged.

#### Scenario: Modal utility

- **WHEN** an element has the class z-modal
- **THEN** it computes z-index: 1400

#### Scenario: Order check

- **WHEN** the tokens test reads layers.css
- **THEN** each layer value is greater than the one before it
- **AND** every layer has a matching utility in tailwind.css

### Requirement: Raw z-index values are rejected in kit sources

ESLint SHALL report a numeric, negative or arbitrary z-index utility in class strings of the component packages and apps, except z-0 and z-auto, and its message SHALL name the layer utilities as the fix.

#### Scenario: New raw value

- **WHEN** a variants file adds the class z-50
- **THEN** pnpm lint fails with the named-layer message
