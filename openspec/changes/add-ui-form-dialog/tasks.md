# Tasks

## 1. Implementation

- [x] 1.1 Add packages/ui/src/components/FormDialog/ (FormDialog.tsx, form-dialog.variants.ts, FormDialog.doc.ts, examples: create, drawer edit, server error; index.ts) and export it from packages/ui/src/index.ts.
- [x] 1.2 Add `keepMounted` to DialogContent and DrawerContent.
- [x] 1.3 Add `useFormDialog` to packages/ui/src/forms/ and export it from packages/ui/src/forms/index.ts, with a forms example.
- [x] 1.4 Move CreateApiKeyDialog and InviteMembersDialog onto FormDialog.
- [x] 1.5 Add `formDialog.failed` and the example copy in form-dialog-messages.ts (en, es).

## 2. Tests

- [x] 2.1 FormDialog.test.tsx and FormDialog.swipe.test.tsx: open and focus, FormData, each result type, pending guards, reset and `keepMounted`, stale results, nested form isolation, drawer variant, every doc keyboard row, axe on the examples in three themes.
- [x] 2.2 useFormDialog.test.tsx and forms-examples.test.tsx: invalid and valid values, save results, reset on close, axe on the example.
- [x] 2.3 Block lifecycle tests: no second key from the secret step, pending guards, reset after a parent-driven close, trigger label; the four existing block test files pass unmodified.

## 3. Docs and release

- [x] 3.1 Add changesets: minor for `@gntik-ai/ui`, patch for `@gntik-ai/blocks`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-ui-form-dialog --strict`.
