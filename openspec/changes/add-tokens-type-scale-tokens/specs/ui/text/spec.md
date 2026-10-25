## Purpose

Text and Heading consume named typography roles while retaining their computed output.

## ADDED Requirements

### Requirement: Text and Heading render through the roles with unchanged output

Every Text variant except code and every Heading size SHALL use a single text-<role> utility. Computed size, leading, tracking and weight SHALL equal f31e4d9 in all themes. Code SHALL retain text-[0.92em].

#### Scenario: Level 2 heading

- **WHEN** Heading level 2 renders with its default size
- **THEN** it has text-heading-lg and computes 24px, leading 1.375, tracking -0.025em and weight 700

### Requirement: Role and tone classes coexist

Both cn and tv SHALL classify every role as a font size, retain its colour tone and resolve conflicting literal sizes in caller order.

#### Scenario: Role plus foreground

- **WHEN** text-heading-lg and text-foreground are merged
- **THEN** both classes remain

#### Scenario: Role replaces a literal size

- **WHEN** text-[13px] is followed by text-label
- **THEN** only text-label remains
