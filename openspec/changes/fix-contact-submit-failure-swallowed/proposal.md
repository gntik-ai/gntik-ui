# Fix contact submit failure swallowed

## Why

At snapshot `138199b`, a rejected contact `onSubmit` leaves the visitor on the form without feedback and escapes as an unhandled rejection. This public page must show a safe error without exposing backend details.

## What changes

Catch failed sends, preserve every form value, and show the existing destructive Alert above the submit button. Use the optional `submitErrorMessage` prop or the new `contact.sendFailed` catalog key in English and Spanish. Clear the alert before a valid retry calls `onSubmit` and when the form resets. Preserve submit-button focus on failure and the existing focused success state on resolution.

Document the error state and its override in live docs examples, regenerate the registry, and add one patch changeset for both `@gntik-ai/templates` and `@gntik-ai/ui`. Templates uses `workspace:*` for UI; Changesets updates internal dependencies on patch releases so the released template requires the catalog-bearing UI version.

## Impact

Applications whose send callback rejects now show a visitor-facing error. No server retries, queues, server field errors, other templates, deployment or data migration are included. Roll back by pinning the previous templates and UI releases or reverting this change.
