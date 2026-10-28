## Purpose

EditableText: accessible inline editing for names and titles with asynchronous saves and errors.

## ADDED Requirements

### Requirement: Activating the preview opens the editor with the text selected

EditableText SHALL render a button whose text is the value, described by "Press Enter to edit", and SHALL open an Input named by the required label with the entire value selected. activation SHALL default to click. dblclick SHALL ignore a single click while retaining Enter activation. button SHALL render static text and a ghost icon button named "Edit {label}" as its only editing trigger. disabled SHALL prevent activation. The editor SHALL inherit surrounding typography.

#### Scenario: Click activation

- **GIVEN** value "Support agent" and label "Agent name"
- **WHEN** the user clicks the preview or presses Enter on it
- **THEN** an input named "Agent name" holds "Support agent" with its entire value selected

#### Scenario: Double-click and explicit button activation

- **WHEN** activation is dblclick
- **THEN** a single click does not edit, a double click does, and Enter still edits
- **AND** with button activation only the icon button named "Edit Agent name" opens the editor

### Requirement: Changed values save once and unchanged values exit

Enter SHALL call onSave once with the trimmed value when changed. trim SHALL default to true and false SHALL preserve whitespace. validate SHALL receive the normalized value and SHALL block onSave when it returns a message. maxLength and placeholder SHALL be passed to the field. Unchanged values SHALL exit without saving. value/defaultValue and editing/defaultEditing SHALL support controlled or uncontrolled state; onEditingChange SHALL request editing changes.

#### Scenario: Save and validation

- **WHEN** the user enters " Ops " and presses Enter
- **THEN** onSave receives "Ops" once
- **AND** validate returning "Name is required" blocks saving and describes the invalid field

### Requirement: Pending and rejected saves retain an accessible editor

EditableSaveResult SHALL be void | boolean | string. void or true SHALL accept. A string SHALL reject with that message; false SHALL reject with "The change could not be saved." (Spanish "No se pudo guardar el cambio."). Thrown errors or rejected promises SHALL display their Error message or the generic fallback. Pending editors SHALL be read-only with aria-busy and a Spinner, never disabled solely because saving is pending. Repeated commits SHALL be ignored while busy. Errors SHALL keep the editor open with aria-invalid, aria-describedby pointing at the message and focus in the field. data-editing, data-pending and data-invalid SHALL expose state.

#### Scenario: Asynchronous save

- **WHEN** the user enters "Billing agent" and presses Enter repeatedly
- **THEN** onSave receives "Billing agent" once and the input is read-only with aria-busy while pending
- **AND** successful resolution shows the accepted value in the preview

#### Scenario: Rejected save

- **WHEN** onSave returns "Name already taken" or rejects Error("Network down")
- **THEN** the editor remains open and described by the respective message with aria-invalid and field focus

### Requirement: Cancellation, blur and multiline preserve expected keyboard behavior

Escape SHALL restore the previous value, skip onSave and call onCancel. Blur SHALL save by default; submitOnBlur=false SHALL cancel instead. multiline SHALL use an auto-sizing Textarea where Enter inserts a newline and Ctrl/Cmd+Enter saves.

#### Scenario: Cancel

- **WHEN** the user changes the draft and presses Escape
- **THEN** the original preview returns, onSave is not called and onCancel is called

#### Scenario: Multiline

- **WHEN** the user presses Enter within a multiline editor
- **THEN** a newline is inserted without saving
- **AND** Ctrl+Enter or Cmd+Enter saves

### Requirement: Focus returns after saving or cancellation except on blur

Successful save or cancel SHALL focus the preview unless focus left the editor by blur, in which case it SHALL remain at the destination.

#### Scenario: Blur to another control

- **WHEN** the user clicks a Delete button while editing or while saving
- **THEN** successful save does not steal focus from Delete

### Requirement: Shared editing preserves table behavior and accessible compositions

useInlineEdit SHALL be exported from @gntik-ai/ui with a custom parse step and self/next/prev/null after-move support. EditableCell SHALL keep its public props, DOM, data attributes, labels, GENERIC_ERROR fallback, number parsing, Tab/Shift+Tab and F2 behavior. Existing DataTable tests SHALL pass unchanged. EditableText as PageHeader title SHALL preserve the h1 accessible name as the value. Live examples SHALL have no axe violations in dark, light and high_contrast. New strings SHALL come from the English/Spanish catalog; styles SHALL use tokens, respect reduced motion, contain no any types, and keep files below 1000 lines.

#### Scenario: Page title

- **WHEN** EditableText renders as PageHeader title with value "Support agent"
- **THEN** the h1 accessible name is "Support agent" and axe reports no violations in each theme
