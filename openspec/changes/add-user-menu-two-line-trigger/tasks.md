# Tasks

## Implementation

- [x] Add showEmail and full-width trigger slots and variant.
- [x] Add a sidebar-footer example and update UserMenu.doc.ts.

## Tests

- [x] Cover the two-line trigger, long e-mail classes, rail collapse, en/es labels, override, missing e-mail, legacy classes and keyboard behavior at the rendered-component seam.
- [x] Cover semantic axe checks closed and open in three themes (jsdom).
- [ ] Run browser layout, collision and contrast checks in three themes in PR CI. The tests are added; this sandbox has no built docs preview or Playwright Chromium executable.

## Docs and release

- [x] Add one minor changeset for @gntik-ai/ui.
- [x] Regenerate registry output; registry:check, library build, lint, typecheck, docs coverage and both kit-only checks pass.
- [x] Validate this change with OpenSpec in strict mode; changeset status includes a minor UI release.

The follow-up review reproduced the example's package self-import failure with `packages/ui/dist` temporarily absent. Relative imports now keep the example and its tests on the source module graph; all 22 UserMenu tests pass without the UI build. Theme checks restore the previous root class in a finally block, and the browser layout check also asserts that the trigger has no vertical overflow.

The requested library test command stops at the existing token mirror-install test because its local HTTP server cannot bind: listen EPERM on 127.0.0.1. The other four token test files pass separately, and all remaining library packages pass with tokens excluded, including UI, blocks, chat and templates. Browser layout, collision and contrast checks remain delegated to PR CI: `pnpm a11y` cannot start its preview because `apps/docs/dist` is absent. Monorepo tests, MCP/evals tests and app builds are delegated to PR CI under the standing sandbox policy.

## CI repair review

The supplied a11y (1/3) failure is in the pre-existing `filter published 0.5.0 default regression dark` test, at `apps/docs/e2e/block-labels.a11y.spec.js:350`. Its initial keyboard trace compares the published and current FilterBar fixtures before opening any popup. The reported difference is a trailing `Saved` in an element's raw `textContent`, not an axe violation or a UserMenu assertion.

Compared with base `f0ac93f1661247c81e686391e7b2e292b315c66e`, this ChangeSet leaves the block-labels test, helpers, fixture, landmark observer, Vite configuration, Select and all block sources unchanged. The FilterBar fixture does not render UserMenu. The excerpt is consistent with retained Select content mounting at different times, but does not establish that cause. No speculative FilterBar/Select repair, pre-existing test edit or CI gate change is justified by this evidence.

The focused reproduction command `pnpm --filter @gntik-ai/docs exec playwright test a11y --grep 'filter published 0.5.0 default regression dark'` and `pnpm a11y` both stop before running tests because the preview cannot start. A direct preview invocation confirms that `apps/docs/dist` does not exist. These browser checks are skipped in this sandbox; PR CI must rerun the failing regression and the new UserMenu layout/axe cases. The reported CI failure remains unresolved.

Follow-up validation passes for the library build, lint, typecheck, registry check, both consumer kit-only checks, all 22 focused UserMenu tests, all four docs unit/coverage test files, strict OpenSpec validation and changeset status. The four token test files that do not require the mirror server also pass. The requested recursive library test command remains skipped because the mirror-install test cannot bind its loopback HTTP server (`listen EPERM` on `127.0.0.1`).
