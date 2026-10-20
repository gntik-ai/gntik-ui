## Purpose

Render accessible keyboard key chips and platform-aware modifier hints.

## ADDED Requirements

### Requirement: Resolve the mod key

Kbd SHALL resolve mod with useOs to ⌘ on macos and ios, and Ctrl otherwise, including undetermined. KbdCombo SHALL pass keys through Kbd with stable React keys. Resolved ⌘ SHALL be announced using kbd.command; Ctrl SHALL use the existing kbd.control catalog entry. Explicit keys and label precedence SHALL remain unchanged. The Kbd catalog SHALL demonstrate useOs and mod and pass axe in all three themes.

#### Scenario: Linux modifier

- **GIVEN** navigator.platform is Linux x86_64
- **WHEN** KbdCombo renders mod and K
- **THEN** it displays Ctrl and K with the modifier announced as Control

#### Scenario: Explicit glyph and custom label

- **GIVEN** the platform is windows
- **WHEN** Kbd renders an explicit ⌘ with a custom label
- **THEN** it keeps the glyph and announces the custom label

### Requirement: Kit shortcut data follows the platform

GlobalSearch fixtures and keyboard-shortcuts template data SHALL use mod for command modifiers. filterShortcuts SHALL accept an optional fourth os argument while preserving the groups, query, locale signature. It SHALL match mod as either ⌘ or Ctrl without case sensitivity, and retain description, title and explicit-key matching. ShortcutSheet SHALL pass useOs() to the filter.

#### Scenario: Search by Ctrl K

- **GIVEN** navigator.platform is Linux x86_64
- **WHEN** GlobalSearch opens and the shortcut sheet renders
- **THEN** Create project and Open the command palette show Ctrl
- **WHEN** the shortcut sheet query is ctrl k
- **THEN** Open the command palette remains visible

#### Scenario: Search by Command K

- **GIVEN** the platform is macos
- **WHEN** the query is ⌘ k
- **THEN** the palette row remains visible
