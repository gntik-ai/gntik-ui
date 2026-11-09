## Purpose

Forms adapter: react-hook-form Form, FormField and useFieldProps bound to the kit Field, with a dependency-free schema resolver.

## ADDED Requirements

### Requirement: Server errors show on their fields when the errors prop changes

When Form receives a new `errors` object, it SHALL store each non-empty entry as a server error for the field at that path, with a snapshot of the field's value, and SHALL replace all earlier server errors. The FormField SHALL show the message and mark its control invalid. For an array value the first entry SHALL be shown; null, undefined and empty-string values SHALL apply nothing, except that an array whose first entry is empty is kept as given. Server errors SHALL be kept apart from react-hook-form's error state.

#### Scenario: Name taken

- **WHEN** Form receives errors with name That name is taken.
- **THEN** the Name field shows That name is taken.
- **AND** its input has aria-invalid true and an accessible description containing the message

#### Scenario: Nested path

- **WHEN** Form receives errors with members.1.email Already a member.
- **THEN** the second member's email field shows Already a member.

#### Scenario: Array value

- **WHEN** Form receives errors with role holding Choose a role. and Role not allowed.
- **THEN** the Role field shows Choose a role.

### Requirement: The errors prop applies by identity

Form SHALL apply `errors` when its object identity changes. Passing the same object again SHALL NOT move focus or restore cleared messages. A new object with equal content SHALL apply again.

#### Scenario: Same object

- **GIVEN** the user edited Name and cleared its message
- **WHEN** Form re-renders with the same errors object
- **THEN** the Name message stays cleared and focus does not move

#### Scenario: Equal new object

- **WHEN** Form receives a new object with the same content
- **THEN** the message is shown again and focus moves to the first errored field

### Requirement: First field with a server error receives focus

After an applied errors object commits, Form SHALL focus the first errored field in document order through its registered control ref when focus is inside the form or on the body, and SHALL NOT move focus otherwise.

#### Scenario: Two errors

- **GIVEN** focus is on the submit button
- **WHEN** Form receives errors for email and name
- **THEN** the Name input has focus

#### Scenario: User moved away

- **GIVEN** focus is on a link outside the form
- **WHEN** Form receives errors for name
- **THEN** focus stays on the link

### Requirement: A server error clears when its field value changes

A server error SHALL be cleared for its field when the field's current value, read from its useController value, differs from the snapshot, and SHALL stay cleared, even if the value is changed back, until a new errors object is applied. Other fields' server errors SHALL stay. Edits SHALL NOT be inferred from unnamed watch, subscribe or form-state notifications.

#### Scenario: Fixing the name

- **GIVEN** server errors on name and email
- **WHEN** the user types one character in Name
- **THEN** the Name message and its aria-invalid are gone
- **AND** the Email message is still shown

#### Scenario: Reverting the value

- **GIVEN** the Name message was cleared by an edit
- **WHEN** the user restores the snapshot value
- **THEN** the Name message does not return

### Requirement: Submit and every reset clear server errors

Server-error state SHALL carry a generation that increments when a new errors object is applied, when the form is submitted, and when it is reset through any path. Submit, `form.reset()` with any options including keepIsSubmitted, afterSubmit reset and rebase, and FormReset SHALL each increment it and clear all server errors. Reset SHALL go through one library function; an interceptor on a consumer's `form.reset()` SHALL exist only while the Form is mounted, restore the original on unmount and pass all arguments and the result through unchanged.

#### Scenario: Reset with keepIsSubmitted

- **GIVEN** a server error on name
- **WHEN** the consumer calls form.reset(undefined, { keepIsSubmitted: true })
- **THEN** the Name message and aria-invalid are gone

#### Scenario: Next submit

- **GIVEN** a server error on name
- **WHEN** the user submits again
- **THEN** the Name message is gone before validation

### Requirement: Validation never changes server errors

Form SHALL NOT wrap, replace or post-process resolvers, `rules.validate` functions or their results, and SHALL NOT tag or filter validation results by generation. No validation result, synchronous or asynchronous, stale or current, SHALL set, restore or clear a server error. While a server error is active its message SHALL be shown with aria-invalid true instead of the client error, which stays in react-hook-form state.

#### Scenario: Validation resolves after a new errors object

- **GIVEN** an asynchronous validation of Name is pending
- **WHEN** Form receives a new errors object for name and the validation then resolves
- **THEN** the new Name message is shown with aria-invalid true

#### Scenario: Validation resolves after a reset

- **GIVEN** an asynchronous validation of Name is pending and the form is then reset
- **WHEN** the validation resolves
- **THEN** no server message is shown

#### Scenario: Edit to another field

- **GIVEN** a server error on name, mode all and an active form.watch()
- **WHEN** the user edits Email and any revalidation of Name resolves
- **THEN** the Name server message is still shown

### Requirement: Unmatched server errors surface as a form-level alert

Form SHALL store entries whose key is empty or matches no mounted FormField, as registered by FormField instances, as the root server error. FormRootError SHALL render it as a destructive Alert with role alert, SHALL render nothing when there is no root error, and the next submit SHALL clear it.

#### Scenario: Quota exceeded

- **WHEN** Form receives errors with an empty key and Quota exceeded for this workspace.
- **THEN** FormRootError shows Quota exceeded for this workspace. with role alert

#### Scenario: Next submit

- **WHEN** the user submits again
- **THEN** FormRootError renders nothing

### Requirement: Forms without errors behave as before

With `errors` unset Form, FormField and useFieldProps SHALL behave as before this change.

#### Scenario: No errors prop

- **WHEN** a form renders without errors
- **THEN** the existing form tests pass unchanged
