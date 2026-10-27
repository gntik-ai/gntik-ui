## Purpose

Chat message box: autosizing text that sends with Enter, a Stop button while a reply streams, validated attachments (pick, paste or drop), a model-picker slot, tool slots and a keyboard hint.

## ADDED Requirements

### Requirement: Submit mode decides which Enter sends

With `submitMode` `enter` the composer SHALL send on Enter and add a line on Shift+Enter; with `mod+enter` it SHALL add a line on Enter and send on Ctrl+Enter or Meta+Enter. In both modes a key pressed during IME composition MUST NOT send. Platform detection SHALL only affect the localized keyboard hint.

#### Scenario: Multi-line prompt

- **GIVEN** `submitMode` is `mod+enter` and the text is `line one`
- **WHEN** the user presses Enter, types `line two` and presses Ctrl+Enter
- **THEN** `onSubmit` is called once with `line one` and `line two` on separate lines

#### Scenario: Default mode

- **WHEN** the user presses Enter with text in the box
- **THEN** `onSubmit` is called once

### Requirement: Insert API edits the text at the caret

`actionsRef.insert` SHALL replace the current selection, or insert at the caret when nothing is selected, MUST report the new text through `onValueChange` in controlled mode, and SHALL leave the caret after the inserted text. Explicit start/end insertion SHALL use those positions. focus SHALL support start/end/all; getValue SHALL return the current text; clear SHALL empty only the text, keeping attachments. The normal ref SHALL remain the textarea.

#### Scenario: Snippet at the caret

- **GIVEN** a controlled composer with `Hello ` and the caret at the end
- **WHEN** the app calls `insert('{{name}}')`
- **THEN** `onValueChange` receives `Hello {{name}}`
- **AND** the caret is at offset 14

### Requirement: Read-only composer keeps text selectable and blocks sending

When `readOnly` is true the text box SHALL be read-only but focusable and selectable, the composer MUST NOT send, attach, remove or retry files, and it SHALL NOT be dimmed like the disabled state. Streaming Stop SHALL remain available.

#### Scenario: Shared transcript

- **GIVEN** `readOnly` is true with text `Draft`
- **WHEN** the user presses Enter in the text box
- **THEN** `onSubmit` is not called
- **AND** the text box still holds `Draft` and can be selected

### Requirement: Header, prefix and footer slots render inside the frame

The composer SHALL render `header` above the attachments, `prefix` at the inline start of the text row and `footer` below the toolbar, all inside the frame; when none is set the DOM MUST match the composer without slots. ChatComposerHeader SHALL support a title, optional close callback and children; its close name SHALL include a string title and otherwise use the generic localized Close label.

#### Scenario: Quote reply

- **GIVEN** `header` is a ChatComposerHeader titled `Replying to Ana` with `onClose`
- **WHEN** the user activates `Close Replying to Ana`
- **THEN** `onClose` is called once
