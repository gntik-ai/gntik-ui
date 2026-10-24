## Purpose

Contact template: a public page with a validated contact form, a focused success state after sending, and office cards.

## ADDED Requirements

### Requirement: Failed send shows an error and keeps the form

When `onSubmit` rejects, the contact page SHALL stay on the form with every value kept and SHALL show a destructive alert with `submitErrorMessage` or the catalog text `contact.sendFailed`, never the raw error. The rejection SHALL be handled, the submit button SHALL leave its loading state, and focus SHALL remain on the submit button without programmatic movement.

#### Scenario: Backend rejects the message

- **GIVEN** a valid form and an `onSubmit` that rejects with `Error('502 Bad Gateway')`
- **WHEN** the visitor presses Send message
- **THEN** an alert reads "We couldn't send your message. Please try again."
- **AND** the name, email, company, topic and message fields keep their values
- **AND** neither the Message sent heading nor status is shown
- **AND** the text `502 Bad Gateway` is not shown
- **AND** the submit button is enabled, is not busy and retains focus
- **AND** no unhandled promise rejection occurs

#### Scenario: Custom message

- **WHEN** `submitErrorMessage` is `Sending is paused. Email us instead.` and `onSubmit` rejects
- **THEN** the alert shows that text instead of the default

#### Scenario: Localized default

- **GIVEN** the Spanish catalog is active
- **WHEN** `onSubmit` rejects
- **THEN** the alert reads "No hemos podido enviar tu mensaje. Inténtalo de nuevo."

### Requirement: Retry after a failed send clears the error

Submitting a valid form again MUST remove the previous error before `onSubmit` is called, and a send that then resolves MUST show the success state exactly as before. Resetting the form SHALL clear the error.

#### Scenario: Second attempt succeeds

- **GIVEN** the error alert from a failed send
- **WHEN** the visitor presses Send message and `onSubmit` resolves
- **THEN** the alert is gone before the callback starts
- **AND** the Message sent status is shown and focused

#### Scenario: Reset after success

- **GIVEN** a successful retry after a failed send
- **WHEN** the visitor chooses Send another message
- **THEN** the form shows its default values without an alert

### Requirement: Validation and successful sends keep existing behavior

Validation failures SHALL return before calling `onSubmit` and SHALL NOT create a send-failure alert. A resolving `onSubmit` SHALL show the existing focused success state without an alert.

#### Scenario: Invalid form

- **WHEN** the visitor submits an invalid form
- **THEN** validation feedback is shown without calling `onSubmit` or rendering a send-failure alert

### Requirement: Failure feedback is accessible and documented

The error SHALL use the existing kit Alert with destructive tone and token classes. Semantic axe checks SHALL pass in dark, light and high_contrast. The docs site SHALL demonstrate failed sends and `submitErrorMessage`.

#### Scenario: Accessible error in each theme

- **WHEN** a valid send fails in dark, light or high_contrast
- **THEN** the feedback has role alert and passes semantic axe checks
