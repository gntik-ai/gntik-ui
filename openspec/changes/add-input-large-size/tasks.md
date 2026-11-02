# Tasks

## 1. Implementation

- [x] 1.1 Add Input size context and large keyboard/icon addons with explicit-size precedence.
- [x] 1.2 Widen PasswordInput and SecretField size unions and add variant slots for large action/icon/strength metrics.
- [x] 1.3 Add shared optional fieldSize props to all five auth blocks; preserve their defaults and use the existing md OTP step.
- [x] 1.4 Set the SSO email field to lg.

## 2. Tests

- [x] 2.1 Run each public rendering regression red before its implementation and green afterward.
- [x] 2.2 Capture default auth markup before block implementation and retain it unchanged; cover configured sign-up fields and both MFA modes.
- [x] 2.3 Add axe checks for new live examples in dark, light and high_contrast (jsdom excludes color contrast).
- [ ] 2.4 Run browser accessibility and visual checks in PR CI; worker policy excludes browser suites and visual baseline commits.
- [x] 2.5 Run final bounded repository checks and strict OpenSpec validation.

## 3. Documentation and release

- [x] 3.1 Document metrics and fieldSize and show all five blocks in live large-field previews.
- [x] 3.2 Add one minor changeset for UI, blocks and templates.
- [x] 3.3 Format, regenerate registry artifacts and commit locally.

## Test seams and red evidence

Tests observe rendered public Input, PasswordInput, SecretField, auth-block and SSO controls: their size classes, accessible names, aria-pressed, keyboard reveal behavior and copy output. Clipboard is the only mocked system boundary. Default block server markup was captured before changing the blocks and is checked without updating snapshots afterward.

Before each implementation, its component test failed on the expected size mismatch: keyboard chip h-[18px] instead of h-[22px], password/secret size-7 instead of size-9, and auth/SSO h-control instead of h-11. Commands: pnpm --filter @gntik-ai/ui exec vitest run src/components/Input/Input.test.tsx (and the corresponding PasswordInput and SecretField test paths); pnpm --filter @gntik-ai/blocks exec vitest run src/auth/<Name>/<Name>.test.tsx for each of the five blocks; pnpm --filter @gntik-ai/templates exec vitest run src/sso-login/Page.test.tsx. Each command was run before its corresponding source change.

## Final validation and limits

Library builds, lint, typecheck, registry:check, both app kit-only checks, the docs production build, docs coverage, preview catalog and strict OpenSpec validation pass. All library package suites excluding tokens, MCP and evals pass, including the new three-theme axe examples and unchanged default auth markup.

The requested library test command including tokens cannot complete offline: tokens/test/mirror-install.test.mjs cannot fetch the public artifact, and its fallback expects gntik-ai-tokens-0.2.1.tgz while the local package packs version 0.3.0 (ENOENT). This is an environment-limited check for PR CI, with no assertion failure in the changed code. Browser accessibility, color contrast and visual suites also run in PR CI under worker policy. No visual baselines are committed.

Vitest reformatted unrelated UserMenu and ChatComposer snapshots without changing their values; those changes were restored before committing. The new auth snapshot is formatted with Prettier. No dependencies were added or updated.
