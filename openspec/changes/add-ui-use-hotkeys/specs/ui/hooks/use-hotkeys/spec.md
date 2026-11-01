## Purpose

Keyboard combinations, sequences, element scopes and shortcut-sheet metadata on one shared listener.

## ADDED Requirements

### Requirement: Combos match exact modifiers with mod as the platform command key

A combo SHALL require exactly its modifiers. mod MUST resolve through getOs at event time to Meta on macOS/iOS and Ctrl elsewhere. Shift SHALL be ignored for symbol keys. Plus joins a combo, spaces form a sequence and comma-space separates alternatives. Named keys including escape, enter, space, plus and arrowup SHALL be supported.

#### Scenario: macOS

- **GIVEN** MacIntel and mod+k registered
- **WHEN** Meta+K, Ctrl+K and Meta+Shift+K are pressed
- **THEN** the handler runs once for Meta+K and prevents its default

#### Scenario: Question mark

- **WHEN** key ? arrives with Shift held
- **THEN** a registered ? handler runs

### Requirement: Character bindings respect typing, composing and repeat guards

Bindings without mod, ctrl, meta or alt SHALL skip input, textarea, select, editable content and menu/listbox/tree targets unless ignoreWhileTyping is false. All bindings MUST skip composing events, keyCode 229 and defaultPrevented events. Repeated keydowns SHALL require repeat: true. enabled SHALL disable a hook or definition, and preventDefault SHALL default to true.

#### Scenario: Slash in a text field

- **GIVEN** / and mod+s are registered
- **WHEN** slash and mod+S arrive inside a text field
- **THEN** only mod+s runs

### Requirement: Sequences require ordered steps within the timeout

Every step SHALL arrive within sequenceTimeout of the previous step, default 1000 ms, without intervening unrelated keys.

#### Scenario: Too slow

- **WHEN** G is followed by D after 1100 ms
- **THEN** g d does not run

#### Scenario: Interrupted

- **WHEN** G, X and D arrive
- **THEN** g d does not run

### Requirement: Layout fallbacks preserve physical shortcuts

Bindings SHALL match event.key case-insensitively and fall back to Key/Digit event.code when key is non-Latin or Alt is held.

#### Scenario: Cyrillic and Option

- **WHEN** key п/code KeyG then key в/code KeyD arrive
- **THEN** g d runs
- **AND** alt+p runs for Option+P with key π/code KeyP

### Requirement: Registrations share one listener with scope and modal precedence

Mounted hooks SHALL share one document keydown listener, attached in an effect and removed after the last unmount. Ref scopes SHALL require focus inside their element and win over global bindings; the most recently mounted equal scope SHALL win. Global character bindings MUST skip focus inside an aria-modal dialog, while command combinations remain active. Inline handlers SHALL update without re-registration. Render and module initialization MUST NOT read document or navigator.

#### Scenario: Dialog open

- **GIVEN** global g d and mod+k bindings and focus in an open modal
- **WHEN** both shortcuts arrive
- **THEN** only mod+k runs

#### Scenario: Listener lifecycle

- **WHEN** three hooks mount and rerender with inline maps
- **THEN** one listener is attached
- **AND** it is removed after the final unmount

### Requirement: Apps can disable global character shortcuts

setCharacterHotkeysEnabled(false) SHALL disable global bindings without mod, ctrl, meta or alt until enabled again. Scoped bindings and command combinations SHALL remain active. Documentation SHALL ask apps to expose this switch for WCAG 2.1.4.

#### Scenario: Switched off

- **WHEN** the switch is false and /, g d and mod+k arrive
- **THEN** only mod+k runs
- **AND** setting true restores character bindings

### Requirement: The registry lists mounted shortcut metadata

useRegisteredHotkeys SHALL use useSyncExternalStore with stable snapshots between changes and an empty server snapshot. Entries SHALL expose hotkey, keys, optional then, description and optional group, compatible with the template Shortcut except for id, and disappear on unmount.

#### Scenario: Sequence entry

- **WHEN** mod+k and g d are mounted with descriptions and groups
- **THEN** their keys are respectively mod/K and G with then D, preserving metadata

### Requirement: Command palette shortcuts retain their public API

useCommandPaletteShortcut SHALL retain its signature and types and register mod+key with description Open the command palette. Meta+K SHALL toggle the palette on macOS/iOS, and Ctrl+K SHALL open it on Windows.

#### Scenario: macOS palette toggle

- **WHEN** Ctrl+K then Meta+K twice arrive on MacIntel
- **THEN** Ctrl+K is ignored and Meta+K opens then closes the palette
