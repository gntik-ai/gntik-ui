## Purpose

Autocomplete: a text field whose value is whatever the user types, with optional sync or async suggestions that fill the input when picked.

## ADDED Requirements

### Requirement: Typed text stays the value on blur, Tab and Enter

Autocomplete SHALL use the input text as its value and MUST NOT replace, clear or restrict it on blur, Tab or Enter when no suggestion is highlighted; Enter with no highlighted suggestion SHALL let the owning form submit with the typed text, whitespace unmodified.

#### Scenario: Unlisted model id

- **GIVEN** suggestions `gpt-4o` and `gpt-4o-mini`
- **WHEN** the user types `gpt-4o-mini-ft-acme` and presses Tab
- **THEN** the value is `gpt-4o-mini-ft-acme`
- **AND** `onValueChange` received it and `onItemSelect` was not called

#### Scenario: Enter submits the typed text

- **GIVEN** the field has `name` `host` inside a form and the popup is open with no highlight
- **WHEN** the user types `db.internal` and presses Enter
- **THEN** the form submits once with `host` equal to `db.internal`

### Requirement: Escape never clears the text

Escape SHALL close an open popup and keep the text; on a closed popup it MUST keep the text, MUST NOT call `onValueChange` and SHALL still reach an enclosing Dialog.

#### Scenario: Two presses inside a Dialog

- **GIVEN** the field holds `west` inside a Dialog with the popup open
- **WHEN** the user presses Escape twice
- **THEN** the first press closes the popup and the second closes the Dialog
- **AND** the text is `west` throughout

#### Scenario: Escape after a keyboard pick

- **GIVEN** the field is inside a Dialog and the user picked a suggestion with ArrowDown and Enter
- **WHEN** the popup has closed and the user presses Escape once
- **THEN** the Dialog closes
- **AND** the input held the picked text until then, and that press caused no `onValueChange` or `onItemSelect` call

#### Scenario: Escape after a pointer pick

- **GIVEN** the field is inside a Dialog and the user clicked a suggestion
- **WHEN** the popup has closed and the user presses Escape once
- **THEN** the Dialog closes with the same outcome as after a keyboard pick

#### Scenario: Escape while the popup is open

- **GIVEN** the popup is open, including after a pick followed by more typing
- **WHEN** the user presses Escape
- **THEN** only the popup closes, the Dialog stays open and the text is unchanged

### Requirement: Picking a suggestion fills the input and reports the item

When the user picks a suggestion with Enter, a click or a press-drag-release, Autocomplete SHALL set the input text to `itemToString(item)`, call `onItemSelect` exactly once with the full item, close the popup and keep focus in the input.

#### Scenario: Keyboard pick

- **GIVEN** items `us-east-1`, `us-west-2` and `eu-west-1`
- **WHEN** the user types `west`, presses ArrowDown and Enter
- **THEN** exactly two options were shown and the input value is `us-west-2`
- **AND** `onItemSelect` is called once with the `us-west-2` item
- **AND** the popup is closed and the input has focus

### Requirement: Async suggestions are debounced, abortable and announced

With `loadOptions`, Autocomplete SHALL load suggestions after `debounceMs` (default 250), MUST abort stale requests, and SHALL announce loading and errors in a status region with a Retry option after a failure. Retry SHALL load again, keep the text and the popup, and not report an item.

#### Scenario: Fast typing

- **WHEN** the user types `ab` then `abc` within 250 ms
- **THEN** `loadOptions` is called once, with `abc`

#### Scenario: Load failure

- **WHEN** `loadOptions` rejects
- **THEN** the status region reads "Couldn’t load options."
- **AND** a Retry option is listed and calls `loadOptions` again when picked

### Requirement: Suggestion limit shows a refine status

When `limit` is set and more suggestions match, Autocomplete SHALL render only `limit` options, counted across groups, and show the `autocomplete.refine` message with the shown and total counts. At or below the limit, and for Retry rows, no refine status SHALL appear.

#### Scenario: Twenty matches, limit five

- **WHEN** 20 suggestions match and `limit` is 5
- **THEN** 5 options are rendered
- **AND** the status reads "Showing 5 of 20. Keep typing to refine."

### Requirement: Groups render named groups

Grouped suggestions SHALL render one `role="group"` per group with matches, named by its header, and hide groups with no matches.

#### Scenario: Filtering hides a group

- **GIVEN** groups Americas and Europe
- **WHEN** the typed text matches only a Europe item
- **THEN** one group named Europe is listed

### Requirement: Inline completion selects the rest of the first match

With `mode` `both`, Autocomplete SHALL, only after an inserted character outside IME composition and only when the first match of the current query starts with the typed text (case-insensitive), show the rest of that match as selected text with `aria-autocomplete="both"`. The value SHALL stay the typed text. Backspace MUST remove only the completion and not complete again until the next inserted character; Tab and blur SHALL keep the typed text; Enter SHALL accept the completion and call `onItemSelect` once. Default `list` mode SHALL have `aria-autocomplete="list"` and never change the text.

#### Scenario: Region completion

- **GIVEN** `mode` is `both` and `us-west-2` is the first match for `us-w`
- **WHEN** the user types `us-w`
- **THEN** the input shows `us-west-2` with characters 4 to 9 selected
- **AND** `onValueChange` last received `us-w`

#### Scenario: Backspace

- **WHEN** the user then presses Backspace
- **THEN** the input value is `us-w` and is not completed again

#### Scenario: Not a prefix

- **WHEN** the user types `west`
- **THEN** the text stays `west`

### Requirement: Autocomplete takes label, description, invalid and disabled from Field

Inside `Field`, Autocomplete SHALL be named by `FieldLabel`, described by `FieldDescription` and `FieldError`, set `aria-invalid` when the field is invalid, and disable the input and its clear button when the field is disabled. Standalone `invalid` SHALL set `aria-invalid` and a visible destructive border, checked on the rendered element: the computed border colour of an invalid group differs from a valid one, standalone and inside an invalid Field, in every theme.

#### Scenario: Invalid field

- **GIVEN** `<Field invalid>` with label "Model id" and description "Any model your provider serves"
- **WHEN** the Autocomplete renders
- **THEN** the input is named "Model id" and described by the description
- **AND** the input has `aria-invalid="true"`

### Requirement: The form value is the typed text and only the hidden input is named

With `mode` `both`, `Field` validation (`onChange` and `onBlur`) and `FormData` SHALL see the typed text (for example `us-w`) and never the displayed completion. The visible input MUST NOT carry a `name`, with or without the `name` prop inside a named Field, so `FormData.getAll(name)` has exactly one entry; a disabled Field submits none. Rendering without `name` after rendering with it, or a named Field without its name, SHALL leave no element with that name and `FormData.getAll` empty once effects flush.

#### Scenario: Typed text in the form

- **GIVEN** `mode` is `both` inside a named Field
- **WHEN** the user types `us-w` and the input shows `us-west-2`
- **THEN** `FormData.getAll(name)` is `["us-w"]` and validation never received `us-west-2`

#### Scenario: Clearing the name

- **GIVEN** the field was rendered with `name` `host`
- **WHEN** it is rendered again without `name`
- **THEN** `FormData.getAll("host")` is empty and no element in the form keeps that name

### Requirement: Clearable

With `clearable`, the clear button SHALL be absent while the value is empty, be named by the `common.clear` message, and on activation set the value to `''` and return focus to the input.

#### Scenario: Clear

- **GIVEN** `clearable` and the text `eu`
- **WHEN** the user activates Clear
- **THEN** the value is empty and the input has focus
