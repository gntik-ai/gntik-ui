## Purpose

A searchable shortcut sheet with working help and search bindings.

## ADDED Requirements

### Requirement: Question mark opens the shortcuts dialog

The keyboard-shortcuts page and standalone KeyboardShortcutsDialog SHALL bind ? through useHotkeys outside typing controls. Slash SHALL focus the page search and the dialog search while focus is inside the dialog. Existing strings and public controlled/uncontrolled props SHALL remain available.

#### Scenario: Open and search from the page

- **WHEN** / is pressed on the page body
- **THEN** the page search receives focus
- **WHEN** ? is pressed outside a text field
- **THEN** the Keyboard shortcuts dialog opens
- **AND** typing ? in its search does not close or reopen it
- **AND** / from its close button focuses its search
