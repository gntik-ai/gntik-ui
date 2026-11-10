# Tasks

## 1. Implementation

- [x] 1.1 Add `rules`, `requirements`, the checklist, the debounced summary and the derived score to PasswordInput, with list, item and icon slots in password-input.variants.ts.
- [x] 1.2 Add the rule definitions and `checkPasswordRules` to password-strength.ts and export them from the PasswordInput index.
- [x] 1.3 Add the `password.requirements`, `password.requirementMet`, `password.requirementUnmet`, `password.requirementsSummary` and `password.rule.*` keys to en.ts and es.ts.
- [x] 1.4 Add a PasswordInputPolicy example (built-in rules plus one custom requirement) and update PasswordInput.doc.ts.

## 2. Tests

- [x] 2.1 PasswordInput.test.tsx: list name and describedby, neutral, met and unmet states, debounced summary with fake timers, derived and explicit strength, unchanged DOM without rules, es catalog.
- [x] 2.2 Unit tests for `checkPasswordRules`; axe on the PasswordInputPolicy example.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-password-input-requirements-checklist --strict`.
