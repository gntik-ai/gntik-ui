## Purpose

Button component of @gntik-ai/ui: the kit's action button with its variants, sizes, icon-only form and loading and disabled states.

## ADDED Requirements

### Requirement: Disabled Button shows the disabled cursor and stays inert

A disabled Button SHALL compute the disabled cursor, MUST NOT fire `onClick` and MUST NOT apply its hover styles.

#### Scenario: Click on a disabled button

- **WHEN** a user hovers and clicks a disabled primary Button
- **THEN** the cursor is `not-allowed`
- **AND** `onClick` is not called and the background stays the same
