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

The requested library test command stops at the existing token mirror-install test because its local HTTP server cannot bind: listen EPERM on 127.0.0.1. The other four token test files pass separately. With tokens excluded, charts, CLI, codemods, editor, flow and icons report success, but the recursive command stops producing output in UI and is interrupted after more than eight minutes without a verdict. A separate blocks/chat/templates run reports chat success but produces no further verdict after more than five minutes and is also interrupted. These incomplete sandbox runs are skipped, not assertion failures. The scoped UserMenu suite passes all 22 tests. Full library and monorepo tests, MCP/evals tests and app builds are delegated to PR CI under the standing sandbox policy.
