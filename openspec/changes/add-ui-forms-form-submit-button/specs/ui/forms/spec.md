## Purpose

Forms adapter: react-hook-form Form, FormField and useFieldProps bound to the kit Field, with a dependency-free schema resolver.

## ADDED Requirements

### Requirement: FormSubmit shows a pending state while an async onSubmit runs

Inside a Form, FormSubmit SHALL render a submit button that is loading (spinner, aria-busy, still focusable) while the form is submitting, and SHALL announce the submitting catalog text through a polite status that is empty otherwise.

#### Scenario: Slow request

- **GIVEN** an onSubmit that resolves after 500 ms
- **WHEN** the user activates FormSubmit labelled Send invitation
- **THEN** the button has aria-busy true, shows the spinner and keeps focus
- **AND** the status reads Submitting…
- **AND** after 500 ms the button is enabled and the status is empty

### Requirement: Form calls onSubmit once per in-flight submit

Form SHALL ignore submit events while a previous submit is still pending, whether they come from a submit button, Enter in a field or `useFormActions().submit()`. The guard SHALL cover asynchronous resolver validation and SHALL allow retry after validation failure or a rejected save.

#### Scenario: Double click

- **WHEN** the user clicks FormSubmit twice within 100 ms
- **THEN** onSubmit is called once

#### Scenario: Enter during the request

- **GIVEN** a submit is pending
- **WHEN** the user presses Enter in a text field
- **THEN** no second onSubmit call starts

#### Scenario: Imperative submit during async validation

- **GIVEN** resolver validation is pending
- **WHEN** useFormActions().submit() is called again
- **THEN** only the initial submission can reach onSubmit

#### Scenario: Invalid input and retry

- **WHEN** validation fails
- **THEN** onSubmit is not called, pending ends and the first invalid field receives focus
- **AND** a later valid submit succeeds

### Requirement: disableWhenClean keeps FormSubmit disabled until the form changes

With `disableWhenClean`, FormSubmit SHALL be disabled while the form is not dirty and enabled while it is dirty; without it the button SHALL be enabled whenever the form is not submitting, unless explicitly disabled by the caller.

#### Scenario: Edit form

- **GIVEN** an edit form whose name defaults to Billing API
- **WHEN** the user types Billing API v2 and then types Billing API back
- **THEN** the button is enabled after the first edit
- **AND** the button is disabled again after the revert

### Requirement: afterSubmit rebase makes the submitted values the new defaults

With `afterSubmit` rebase, Form SHALL reset its defaults to raw getValues() input values after onSubmit resolves, so the form is no longer dirty, and SHALL leave values and dirty state unchanged when onSubmit rejects. The default policy SHALL be keep; reset SHALL restore the original defaults after a successful save. Post-save policies SHALL run only inside the successful handleSubmit callback after onSubmit resolves.

#### Scenario: Successful save

- **WHEN** onSubmit resolves for an edited name under rebase
- **THEN** the form is not dirty
- **AND** the raw edited name, rather than transformed schema output, is the new default

#### Scenario: Failed save

- **WHEN** onSubmit rejects under any policy
- **THEN** the form is still dirty
- **AND** the edited name is kept

#### Scenario: Reset after success

- **GIVEN** afterSubmit is reset
- **WHEN** onSubmit resolves
- **THEN** the original defaults are restored and the form is clean

#### Scenario: Existing form

- **GIVEN** a form uses neither the new parts nor afterSubmit
- **WHEN** onSubmit resolves
- **THEN** its existing values and defaults are preserved

### Requirement: FormReset restores the defaults and is disabled while clean

FormReset SHALL render a type=button ghost Button labelled Discard by default, reset the form to its default values and clear its errors when activated, and SHALL be disabled while the form is clean or submitting.

#### Scenario: Discard edits

- **GIVEN** a dirty form with an error on the email field
- **WHEN** the user activates FormReset
- **THEN** every field shows its default value
- **AND** no error message is shown
- **AND** FormReset is disabled

### Requirement: Form actions share the guarded native submit path

useFormActions SHALL expose submit, reset, isDirty and isSubmitting inside Form. submit SHALL call requestSubmit so validation, the guard and afterSubmit apply; reset SHALL restore defaults. The docs SHALL show Save and Discard and describe StickyActionBar bindings without a ui dependency on blocks.

#### Scenario: Toolbar save and discard

- **WHEN** Save invokes submit twice while pending
- **THEN** onSubmit is called once
- **AND** Discard invokes reset to restore defaults

### Requirement: FormSubmit supports a plain fallback outside Form

Outside Form, FormSubmit SHALL render a plain submit Button with no status region and warn once per mounted instance only in development. useFormActions SHALL throw outside Form.

#### Scenario: Production fallback

- **WHEN** FormSubmit renders outside Form in production
- **THEN** it is a plain submit button with no status region and no warning

### Requirement: Form actions are localized and accessible

New visible and accessible strings SHALL come from en and es catalogs. New controls SHALL use token classes and strict TypeScript. Invitation and edit settings examples SHALL be documented and axe-clean in dark, light and high_contrast.

#### Scenario: Spanish pending state

- **GIVEN** the locale is es
- **WHEN** submission is pending
- **THEN** the status reads Enviando… and default labels are Guardar and Descartar
