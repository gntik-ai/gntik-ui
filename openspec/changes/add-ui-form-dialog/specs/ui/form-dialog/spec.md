## Purpose

FormDialog: a dialog or drawer that hosts a form and owns its lifecycle (trigger, pending submit, close on success, submit errors and reset on close).

## ADDED Requirements

### Requirement: Submit result decides whether the dialog closes

FormDialog SHALL call `onSubmit` with the form data and close when it returns nothing or `true`; it MUST stay open when the result is `false`, and stay open showing the message when the result is a string or the call throws or rejects.

#### Scenario: Success

- **WHEN** `onSubmit` resolves to `undefined`
- **THEN** the dialog closes and focus returns to the trigger
- **AND** `onClosed` is called once

#### Scenario: Server message

- **WHEN** `onSubmit` returns `Quota name already exists`
- **THEN** the dialog stays open
- **AND** an alert reading `Quota name already exists` is shown at the top of the body

### Requirement: Pending submit blocks closing and repeated submits

While an `onSubmit` promise is pending, FormDialog SHALL mark the submit button busy and disable Cancel, and MUST ignore Escape, backdrop clicks, the close button and further submits.

#### Scenario: Escape while saving

- **GIVEN** `onSubmit` is pending
- **WHEN** the user presses Escape and then Enter
- **THEN** the dialog stays open
- **AND** `onSubmit` has been called once

### Requirement: Closing resets the dialog content

Unless `keepMounted` is set, FormDialog SHALL unmount its content when it closes so the next open starts from the initial field values, and it MUST call `onClosed` after every close.

#### Scenario: Reopen

- **GIVEN** the user typed `staging` into an uncontrolled input and cancelled
- **WHEN** the dialog is opened again
- **THEN** the input is empty
- **AND** `onClosed` was called once

### Requirement: Dialog form submits do not reach outer forms

Submitting the FormDialog form SHALL call only its own `onSubmit` and MUST NOT trigger a submit handler of a form that renders the FormDialog.

#### Scenario: Nested in a page form

- **GIVEN** a FormDialog rendered inside a settings `<form>` with its own `onSubmit` spy
- **WHEN** the user submits the dialog
- **THEN** the dialog's `onSubmit` is called
- **AND** the settings form's spy is not called

### Requirement: Drawer variant shares the dialog lifecycle

With `variant` `drawer`, FormDialog SHALL render in a Drawer on `side` with the same submit result handling, pending guards, errors and reset on close as the dialog variant.

#### Scenario: Drawer error

- **GIVEN** `variant` is `drawer` and `side` is `right`
- **WHEN** `onSubmit` rejects with `Error('Timeout')`
- **THEN** the drawer stays open and shows `Timeout`

### Requirement: useFormDialog wires react-hook-form validation and reset

`useFormDialog(form, save)` SHALL return submit and close handlers that call `save` only with valid, parsed values, keep the dialog open and focus the first invalid field when validation fails, and MUST reset the form to its default values when the dialog closes.

#### Scenario: Invalid name

- **GIVEN** the schema requires `name` and it is empty
- **WHEN** the user submits
- **THEN** `save` is not called
- **AND** the name field has focus and shows its error
