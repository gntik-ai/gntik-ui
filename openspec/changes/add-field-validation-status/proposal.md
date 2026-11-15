# Field validation status

## Why

Field currently exposes only invalid feedback. Consumers need non-blocking warnings, success and pending feedback, plus cancellable asynchronous form checks that work with schema resolvers.

## What Changes

- Add optional Field status and feedbackIcon, linked FieldWarning/FieldSuccess descriptions, useFieldStatus and localized polite announcements.
- Show decorative feedback in Input and NumberInput; warning alone tints the border.
- Add FormField warning, success, asyncValidate and asyncDebounceMs, with abortable edit checks and a submit gate after schema validation.
- Document the additive API with live examples and a minor UI changeset.

## Impact

- Affected specs: ui/field, ui/forms (new ADDED requirements; no baseline).
- Affected code: UI Field, Input, NumberInput, forms adapter, i18n and generated documentation registry.
- Existing default DOM remains unchanged. Invalid always wins. No server requests are provided by the library.
- Excludes other controls, token changes, releases and deployment.
