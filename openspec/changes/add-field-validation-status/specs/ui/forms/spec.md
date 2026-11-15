## Purpose

React-hook-form adapter with debounced async checks alongside schema validation.

## ADDED Requirements

### Requirement: Debounce async validation and abort stale runs

FormField asyncValidate(value, {signal, values}) SHALL run after an edit and asyncDebounceMs (default 300), abort previous runs on edits and unmount, clear pending timers and ignore aborted results. Untouched initial values SHALL remain idle until submission. StrictMode SHALL NOT duplicate validators. Pending runs SHALL show validating. Returned messages SHALL use setError with type async; only async errors SHALL be cleared on a passing run. Schema and server errors SHALL NOT be overwritten. Optional warning and success messages SHALL remain non-blocking.

#### Scenario: Untouched field

- **GIVEN** a newly mounted field, including under StrictMode
- **WHEN** 300 ms elapses without an edit
- **THEN** the validator has not run and the field remains idle
- **AND** submitting still runs the validator for its default value

#### Scenario: Fast typing

- **WHEN** acme-prod is typed within 300 ms
- **THEN** the validator runs once with acme-prod
- **AND** the field is validating until settled

#### Scenario: Superseded run

- **GIVEN** a pending run for acme
- **WHEN** the value becomes acme-prod
- **THEN** the old signal is aborted and its result cannot change the field

#### Scenario: Unmount

- **WHEN** a pending field is unmounted
- **THEN** its signal is aborted without a React state-update warning

#### Scenario: Passing edit

- **GIVEN** an async error
- **WHEN** the edited value passes the next check
- **THEN** the async error clears
- **AND** errors of other types are preserved

### Requirement: Gate form submit on async checks

After schema validation passes, Form SHALL await every mounted async validator, set returned messages as async field errors, focus the first failing field in document order and skip onSubmit on failure. Its concurrent-submit guard SHALL cover this gate. Callback values SHALL be raw form values and onSubmit SHALL retain schema transformations.

#### Scenario: Taken slug

- **GIVEN** asyncValidate returns That slug is taken.
- **WHEN** the form is submitted
- **THEN** the message is shown and the field receives focus
- **AND** onSubmit is not called

#### Scenario: Concurrent submissions

- **WHEN** the user submits again during an async gate
- **THEN** no duplicate validator or onSubmit call is made

#### Scenario: Edit during submission

- **WHEN** a value changes during the async gate
- **THEN** schema validation and async checks restart for the current values under the same submit guard
- **AND** onSubmit receives only the newly validated schema output, once all checks pass

#### Scenario: Existing forms

- **WHEN** new FormField props are unset
- **THEN** the existing DOM and validation behavior remain unchanged
