## Purpose

useDialogs and DialogsProvider: promise-based confirm, alert, prompt and custom dialogs rendered with the kit dialogs, so actions started from menus and rows need no mounted dialog state.

## ADDED Requirements

### Requirement: Confirm resolves to the user's choice

`confirm(message, options)` SHALL render an alert dialog with the title, message and tone, and SHALL resolve `true` when the confirm button is activated and `false` on Cancel or Escape. The dialog SHALL be removed from the DOM once the promise settles.

#### Scenario: Revoke a key

- **WHEN** `confirm('This key stops working at once.', { title: 'Revoke API key', confirmLabel: 'Revoke' })` is awaited and Revoke is activated
- **THEN** the promise resolves true
- **AND** the dialog is removed

#### Scenario: Escape

- **WHEN** the user presses Escape in the confirm dialog
- **THEN** the promise resolves false

### Requirement: Typed confirmation gates the confirm button

With `typeToConfirm`, the dialog SHALL show a labelled text field and the confirm button SHALL stay disabled until the field holds exactly that value, compared case-sensitively.

#### Scenario: Wrong case

- **GIVEN** `typeToConfirm` is prod-db
- **WHEN** the user types Prod-db
- **THEN** the confirm button stays disabled

#### Scenario: Locale

- **GIVEN** the es locale
- **THEN** the field is labelled Escribe prod-db para confirmar

### Requirement: Async confirm keeps the dialog open while the action runs

When `onConfirm` returns a promise, the confirm button SHALL show a pending state with aria-busy, Cancel SHALL be disabled, Escape and outside presses MUST NOT close the dialog until it settles, a resolve SHALL close it with `true`, and a rejection SHALL keep it open with the error message in an alert and both buttons enabled.

#### Scenario: Action fails

- **WHEN** `onConfirm` rejects with the message Key in use
- **THEN** the dialog stays open
- **AND** Key in use is shown with role alert
- **AND** both buttons are enabled again
- **AND** Cancel then resolves false

### Requirement: Prompt resolves to the entered text or null

`prompt(message, options)` SHALL resolve the field value when OK is activated or Enter is pressed and `null` on Cancel; while `validate` returns a message, the field SHALL show it and OK SHALL be disabled.

#### Scenario: Rename

- **GIVEN** `defaultValue` staging and a validator that rejects empty values
- **WHEN** the user types staging-2 and presses Enter
- **THEN** the promise resolves staging-2

### Requirement: Custom dialogs resolve with the result their component returns

`open(Component, payload)` SHALL render the component with `payload`, `open` and `onClose`, and SHALL resolve with the value passed to `onClose`; `update` SHALL re-render it with a new payload and `close` SHALL resolve it with the given result.

#### Scenario: Close from outside

- **WHEN** `close(dialog, 'x')` is called for a dialog opened with `open`
- **THEN** the dialog closes
- **AND** its promise resolves x

### Requirement: Stacked dialogs close from the top and closeAll settles every promise

Each call SHALL open above the dialogs already open, and Escape SHALL close only the topmost. `closeAll()` and unmounting the provider SHALL resolve every open dialog with its cancel value: `false` for confirm, `null` for prompt and `undefined` otherwise, and SHALL leave no dialog in the DOM, without an unhandled rejection.

#### Scenario: Confirm over a custom dialog

- **WHEN** a confirm opened from inside an open dialog is dismissed with Escape
- **THEN** only the confirm closes
- **AND** focus returns inside the dialog below

#### Scenario: Route change

- **WHEN** `closeAll()` is called with a confirm and a prompt open
- **THEN** the confirm resolves false
- **AND** the prompt resolves null

### Requirement: Focus returns to the opener or to the trigger of a closed menu

On close, focus SHALL move to `returnFocus` when given, else to the element focused when the call was made, and when that element has left the document, to the trigger of the menu it belonged to. Focus SHALL be restored only through the popup's `finalFocus`, never through a timer that calls `focus()`. While another dialog remains open, closing a dialog SHALL leave focus inside the topmost open dialog; focus SHALL reach the opener of the first dialog only when the stack becomes empty.

#### Scenario: Confirm from a row menu

- **GIVEN** a row Menu whose Revoke item calls `confirm()`
- **WHEN** the user activates Revoke and then Cancel
- **THEN** focus is on the menu trigger button

#### Scenario: Closing the lower dialog first

- **GIVEN** focus on an outside button, a custom dialog open, and a confirm opened above it
- **WHEN** `close(handle, result)` is called for the custom dialog
- **THEN** the confirm stays open and keeps focus
- **AND** after the confirm closes, focus is on the outside button

### Requirement: StrictMode effect replay leaves no orphan dialog

Dialog entries and pending promise records SHALL be kept consistent: settling, Cancel, `closeAll()`, effect cleanup and provider unmount SHALL remove the dialog entry in the same update even when its pending record is already gone, and settlement SHALL be idempotent.

#### Scenario: confirm() in an effect under StrictMode

- **GIVEN** the provider inside React.StrictMode and a child whose effect calls `confirm()`
- **WHEN** Cancel is activated, or separately `closeAll()` is called
- **THEN** no dialog remains in the DOM
- **AND** every returned promise has settled exactly once

### Requirement: useDialogs requires the provider

`useDialogs()` rendered without `DialogsProvider` SHALL throw an error whose message names DialogsProvider.

#### Scenario: Missing provider

- **WHEN** a component calls `useDialogs()` outside `DialogsProvider`
- **THEN** it throws an error naming DialogsProvider
