## 1. Implementation

- [x] 1.1 Add keyboard-only focus-ring and focus-ring-inset utilities with token-backed colours.
- [x] 1.2 Migrate matching package classes, existing inside outlines and zero-offset cells; preserve state-keyed outlines and other offsets.
- [x] 1.3 Add brand lint diagnostics for Literal and TemplateElement strings.
- [x] 1.4 Update CONTRIBUTING and MCP guidance; leave agent configuration for human maintainers.

## 2. Tests

- [x] 2.1 Test utility declarations and observe failures before implementation.
- [x] 2.2 Test lint rejection and exemptions, and observe the source scan fail before migration.
- [x] 2.3 Add compiled CSS coverage for local theme aliases, failing before the alias fix.
- [x] 2.4 Test cn/tv focus-utility merging red before registering the group; preserve pinned nested Link/Breadcrumbs HTML by de-duplicating at the last caller position.
- [x] 2.5 Add browser comparisons across three themes, pointer focus and clipped inset rows.
- [ ] 2.6 Run browser and catalog visual suites in PR CI; worker policy forbids these suites locally.

## 3. Docs and release

- [x] 3.1 Document utilities on Button.doc.ts with a live focus preview.
- [x] 3.2 Add one changeset: tokens minor plus patches for changed public packages.
- [x] 3.3 Regenerate registry output and validate OpenSpec strictly.
- [x] 3.4 Run bounded library build, unit tests, lint, typecheck, registry and kit-only checks.
- [ ] 3.5 Complete the unchanged tokens mirror-install test in networked CI: the worker cannot fetch the registry artifact, and the offline fallback expects a missing gntik-ai-tokens-0.2.1.tgz file.
