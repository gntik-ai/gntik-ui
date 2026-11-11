## Purpose

Switch: an on/off setting on Base UI Switch that applies immediately, in three sizes, with an optional inline label, working inside Field and Form.

## ADDED Requirements

### Requirement: Loading switch ignores toggles and keeps focus

While `loading` is true, Switch SHALL ignore pointer, Space and Enter activation without calling `onCheckedChange` or changing `aria-checked`, and SHALL stay focusable in the Tab order.

#### Scenario: Second press while saving

- **GIVEN** an unchecked switch with `loading`
- **WHEN** the user presses Space
- **THEN** `onCheckedChange` is not called
- **AND** `aria-checked` stays false

#### Scenario: Keyboard focus stays

- **WHEN** the user tabs to the loading switch
- **THEN** the switch receives focus
- **AND** the next Tab moves to the following control

### Requirement: Loading switch exposes the busy state and a saving description

While `loading`, Switch SHALL set `aria-busy="true"`, render a spinner hidden from assistive technology inside the thumb, and add the `switch.saving` text or `loadingLabel` to its accessible description; when `loading` ends all three SHALL be removed.

#### Scenario: Saving

- **WHEN** a switch renders with `loading`
- **THEN** it has `aria-busy="true"`
- **AND** its accessible description includes Saving…

#### Scenario: Saved

- **GIVEN** a switch whose `loading` changes to false
- **WHEN** the user presses Space
- **THEN** the switch has no `aria-busy`
- **AND** `onCheckedChange` is called

### Requirement: Disabled takes precedence over loading

When `disabled` and `loading` are both set, Switch SHALL render as disabled and MUST NOT set `aria-busy`.

#### Scenario: Disabled while loading

- **WHEN** a switch renders with `disabled` and `loading`
- **THEN** the switch is disabled
- **AND** it has no `aria-busy`
