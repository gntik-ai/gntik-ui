# Tasks

## Implementation

- [x] Add AgentSurface, runtime protocol guards, catalog, pointer and immutable model handling.
- [x] Add the ten allow-listed default kit entries and public exports.
- [x] Label agent content and recover focus when deleting a surface.
- [x] Add en/es messages and chat fallbacks.

## Tests

- [x] Test each behavior before its implementation at the renderer or pointer seam.
- [x] Cover progressive rendering, DOM identity, actions and two-way/model updates.
- [x] Cover unknown types, invalid props, URL/HTML/handler controls and custom-validator errors.
- [x] Cover malformed/versioned commands, graph limits and prototype-pollution guards.
- [x] Cover focus recovery, keyboard operation and semantic axe checks in three themes (jsdom).

## Docs and release

- [x] Add live docs with every default entry, patches, actions, rejection and deletion.
- [x] Add one changeset: minor chat and patch ui.
- [x] Regenerate registries and run repository gates; the token mirror-install test requires a local socket (listen EPERM in the sandbox).
- [x] Validate OpenSpec with the CLI in strict mode.
- [ ] Run browser axe with color contrast in PR CI; the sandbox has no Playwright Chromium executable.

The full monorepo test command and the excluded MCP/evals suites run in PR CI under the standing repository policy.
