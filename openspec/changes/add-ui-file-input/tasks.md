# Tasks

## 1. Implementation

- [x] 1.1 Add FileInput, FileTrigger, useFileDialog, variants and component exports.
- [x] 1.2 Reuse validateFiles and add English/Spanish catalog messages.
- [x] 1.3 Adopt conditional FileTrigger in ProfileHeader and ChatComposer; update only picker lookup scope and remove the saved inline input.
- [x] 1.4 Separate the picker and named form input; handle form reset and platform feature detection.

## 2. Tests

- [x] 2.1 Add field value, rejection, keyboard, clear, disabled/invalid, locale, named-input synchronization and reset tests.
- [x] 2.2 Add trigger and hook keyboard, attributes, cancellation, reset, unmount and SSR tests.
- [x] 2.3 Add consumer picker scope/hidden-action tests; retain other existing assertions.
- [x] 2.4 Add examples with axe checks in three themes and native FormData/modal browser coverage. Correct the form locators and cover real reset-button clicks with controlled values, unchanged/changed defaultValue, and React-prevented reset. Local browser execution is skipped: server listen and Chromium launch are denied by the sandbox; PR CI must run the focused spec.

## 3. Docs and release

- [x] 3.1 Add component documentation and live examples for fields, states, multiple, triggers and the hook.
- [x] 3.2 Add one ui minor / blocks patch / chat patch changeset; regenerate registry output.
- [x] 3.3 Run strict OpenSpec validation and bounded repository checks; commit locally. Browser suites run in PR CI; the local reset regression models the trusted-event microtask checkpoint and is not native FormData proof.
