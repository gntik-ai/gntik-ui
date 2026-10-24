# Tasks

## 1. Implementation

- [x] 1.1 Catch failed sends, preserve values and focus, render the kit Alert, and clear it on retry and reset.
- [x] 1.2 Add the documented optional `submitErrorMessage` prop and `contact.sendFailed` in en and es.
- [x] 1.3 Describe the error state in contact/template.meta.ts.

## 2. Tests

- [x] 2.1 Run the rejecting-submit regression against snapshot `138199b` before changing source.
- [x] 2.2 Cover preserved fields, safe messages, loading, focus, retry ordering, custom copy, successful sends, validation, Spanish and semantic axe in all three themes.

## 3. Docs and release

- [x] 3.1 Demonstrate rejected sends and the override on the docs site.
- [x] 3.2 Add one patch changeset for templates and UI and regenerate registry output.
- [x] 3.3 Format changed files, run required repository checks and strict OpenSpec validation, and record environment limitations.

## Test seams

Tests drive ContactPage through its rendered form and observe alerts, fields, submit-button loading and focus, and the success status. The consumer-provided onSubmit callback is the external submission boundary; its retry implementation checks the rendered alert before continuing. The real I18nProvider verifies Spanish catalog selection. The existing jsdom axe helper checks semantic accessibility in dark, light and high_contrast. The new contact-submit.a11y.spec.js drives both live failure examples in each theme and checks browser axe (including contrast), focus, preserved values, page errors and a successful retry; browser suites run in PR CI.

## Validation evidence

Before source changes, `pnpm --filter @gntik-ai/templates test src/contact/Page.test.tsx -t 'keeps the form and safely announces a failed send'` failed twice against `138199b` with a missing role=alert and an unhandled rejection carrying `502 Bad Gateway`. The cause is the original `try/finally` without a catch around the submission callback. The final focused suite passes all ten tests, including both existing tests unchanged, without unhandled rejections.

The retry test also failed before the synchronous state commit: React batched the alert removal until after the callback started. `flushSync` commits that removal before invoking the consumer callback. The test now observes no alert inside the second callback, then the focused success status and a clean reset. No focus movement is added to the failure path.

Library builds, lint, monorepo typecheck, registry drift, docs coverage, both consumer kit-only checks, changed-file formatting and strict OpenSpec validation pass. The typecheck was rerun successfully after an earlier run exited without diagnostics while builds were in progress.

The required recursive library test command stops at the token mirror-install test: the public registry is unavailable, and its offline fallback cannot find `gntik-ai-tokens-0.2.1.tgz` (ENOENT; the current local token package is 0.3.0). This environment-dependent check remains for PR CI. The other five token suites pass separately. Browser accessibility, visual suites, full monorepo tests, MCP/evals tests and app builds run in PR CI under the standing worker policy.

All ten remaining library packages pass with tokens excluded: `pnpm -r --filter './packages/**' --filter '!@gntik-ai/gntik-ui-mcp' --filter '!@gntik-ai/evals' --filter '!@gntik-ai/tokens' test`, including the complete UI, blocks and templates suites.

The registry generator embeds the English catalog into UI registry payloads, so the additive catalog key also updates the generated shadcn registry files and their integrity manifest. These are generated changes; no unrelated source or dependency changes are included.
