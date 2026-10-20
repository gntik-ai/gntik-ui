## Purpose

Display the correct platform modifier in the command palette trigger without changing bindings.

## ADDED Requirements

### Requirement: Default hints follow the platform

CommandPaletteTrigger SHALL default to mod and K. Explicit keys SHALL render as given. useCommandPaletteShortcut SHALL continue accepting metaKey or ctrlKey on every OS.

#### Scenario: Default Windows trigger

- **GIVEN** navigator.platform is Win32
- **WHEN** the default CommandPaletteTrigger renders
- **THEN** it shows Ctrl and K, no ⌘, and announces Control

#### Scenario: Default Mac trigger

- **GIVEN** navigator.platform is MacIntel
- **WHEN** the default CommandPaletteTrigger renders
- **THEN** it shows ⌘ and K, announced as Command

#### Scenario: Explicit keys

- **GIVEN** the platform is windows
- **WHEN** the trigger receives keys ⌘ and K
- **THEN** it displays those keys unchanged
