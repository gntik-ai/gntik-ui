# Tasks

## 1. Implementation

- [x] 1.1 Add invalid attributes to SelectTrigger and SimpleSelect and shared invalid trigger borders with interaction precedence.
- [x] 1.2 Share Combobox invalid field styles and add invalid to both input forms.
- [x] 1.3 Add Switch ring and Slider thumb borders with accessible invalid state.
- [x] 1.4 Add localized invalid examples and error-message guidance for all four controls.

## 2. Tests

- [x] 2.1 Test explicit invalid state, inherited Field state, explicit aria-invalid precedence and valid defaults at rendered control seams.
- [x] 2.2 Verify FormInviteMember role error attributes clear after selecting a role.
- [x] 2.3 Add browser computed-border, interaction, high-contrast ring and axe coverage in all three themes.
- [ ] 2.4 Run browser a11y and visual suites in PR CI.

## 3. Docs and release

- [x] 3.1 Add one minor changeset for @gntik-ai/ui.
- [x] 3.2 Regenerate registry and llms output.
- [x] 3.3 Run repository gates and strict OpenSpec validation (token mirror-install has an unrelated offline fallback version mismatch; browser suites run in PR CI).

## Amended issue review (2026-11-10)

- Retain delivery commits `c5cecdae`, `87c15614` and `062d364e`: the regenerated acceptance criteria require no additional source changes or dependencies.
- Verify the rendered Select, both Combobox inputs, checked and unchecked Switch, range Slider and FormInviteMember seams, including explicit aria-invalid precedence and valid defaults. The focused run passes all 133 tests across seven files, including variant and localized example axe coverage.
- Pass the complete `@gntik-ai/ui` suite: 3,043 tests across all 290 files, with no skipped tests.
- Pass all nine remaining non-token library suites separately after the recursive command stops at tokens. The tokens rerun passes 17 test files; only mirror-install fails for the sandbox reason below. MCP and evals tests remain assigned to PR CI by the worker rules.
- Compare all six changed snapshot files against base `50daab66`: removing invalid-only classes leaves identical content, including the SettingsLayout and settings-profile DOM fixtures. No visual baseline screenshots change.
- Regenerate the registry: all generated output is unchanged. Keep the existing single minor changeset for `@gntik-ai/ui`, including its note that caller-supplied aria-invalid receives destructive styling.
- Pass all library builds, monorepo lint and typecheck, registry:check, both app kit-only checks, docs coverage, strict OpenSpec validation and formatting checks. Lint reports one existing react-hooks/incompatible-library warning and no errors.
- Reproduce the untouched `packages/tokens/test/mirror-install.test.mjs` sandbox failure and rerun it: offline fallback packs the current tokens version but reads `gntik-ai-tokens-0.2.1.tgz`, raising ENOENT at line 93. Report this check as SKIPPED under the operator decision; do not change tokens or its fixtures.
- Leave browser computed styles, Switch high-contrast ring contrast, browser axe and visual checks to PR CI. Task 2.4 remains open; browser suites run in PR CI.

## CI repair (2026-11-10)

- Reproduce the catalog name collision at the rendered examples seam with `pnpm --filter @gntik-ai/ui exec vitest run src/components/Select/invalid-examples.test.tsx`: the clearable and invalid examples both expose a combobox named Region. Give the invalid example the translated name Required region / Región obligatoria; the clearable Region example remains uniquely addressable. Keep all invalid styling and accessibility assertions in the new browser spec, updating only its example label.
- Reproduce the canonical usage failure with `cd packages/mcp && node test/base-ui-usage.test.mjs`: alphabetic example selection chooses SwitchInvalid.tsx before SwitchSettings.tsx. Rename the new example to SwitchValidation.tsx so SwitchSettings.tsx stays canonical, update its import and documentation reference, and regenerate the registry and language-model docs. The pre-existing MCP regression test passes without changes.
- Add the rendered Select example composition regression to this ChangeSet's new test file. The seven focused control, form, variant and example test files pass all 134 tests.
- Pass the complete `@gntik-ai/ui` suite: all 3,044 tests across 290 files, without skips. The nine remaining non-token library suites also pass. Library builds, monorepo lint and typecheck, registry:check, docs coverage, both app kit-only checks, strict OpenSpec validation and formatting also pass.
- Rerun the untouched tokens suite: 17 test files pass; only mirror-install fails. Running that file directly confirms the sandbox's offline fallback still reads the missing `gntik-ai-tokens-0.2.1.tgz` at line 93. Report this as SKIPPED under the operator decision.
- Preserve the existing single minor changeset, pre-existing tests, workflows and component implementations. Browser a11y suites remain assigned to PR CI.

## Checks-job revalidation (2026-11-10)

- Start from the supplied clean worktree at `52c8befc`; retain the existing implementation and CI repair. The supplied `checks` excerpt contains no failing assertion: its MCP suites report zero failures, and its release-fixture messages are skips. The full local docs suite identifies the remaining failure in the pre-existing styling-hook contract.
- Re-run the seven focused control, form, variant and example files: all 134 tests pass. Re-run the pre-existing MCP canonical-usage regression directly: it passes, including SwitchSettings as the representative Switch example.
- Reproduce with `cd apps/docs && node test/styling-hooks.test.mjs`: the public docs boundary fails on `Slider root data-invalid meaning`. Document the invalid root hook, then observe and document the missing descendant `data-index` selector meaning, followed by the missing Switch invalid root hook. The unchanged regression passes with `cd apps/docs && node --test test/styling-hooks.test.mjs`. No test or gate is modified.
- Regenerate the registry after repairing the metadata. Compare all changed DOM/class snapshots and outline fixtures with base `50daab66`: every added class is limited to invalid state, with identical remaining content.
- Pass all 18 files in the complete docs suite, including styling hooks and docs coverage. Pass the final library builds, typecheck, registry check, app kit-only checks and strict OpenSpec validation. Preserve all pre-existing tests and the existing single minor changeset.
- Pass the complete UI suite: all 3,044 tests across 290 files, with no skips. Lint passes on retry with the existing React Hook Form warning and no errors.
- Pass the remaining library suites: the final blocks run passes 1,224 tests across 163 files, templates passes 539 tests across 83 files, and the other seven non-token library packages pass their recursive runs. Keep MCP CLI and evals suites assigned to PR CI under the worker rules.
- Re-run the untouched tokens suite and mirror-install in isolation. Seventeen token test files pass; mirror-install repeatedly raises ENOENT at line 93 while reading `gntik-ai-tokens-0.2.1.tgz` from its offline fallback. Report it as SKIPPED under the operator decision; preserve tokens and its tests.
- Browser computed styles, high-contrast ring contrast, browser axe and visual checks remain assigned to PR CI.
