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
