# Tasks

## 1. Implementation

- [x] 1.1 Add parser, shared registry, useHotkeys, metadata hook and character switch; export from the root UI entry.
- [x] 1.2 Adopt the hook in useCommandPaletteShortcut, preserving signature and types.
- [x] 1.3 Bind ? and / in the keyboard-shortcuts template.

## 2. Tests

- [x] 2.1 Cover syntax, symbols, named keys, modifiers and layout fallback.
- [x] 2.2 Cover guards, sequences, timeout, interruption, scopes, precedence, listener lifecycle, inline maps, registry snapshots, switch, SSR and event-time OS detection.
- [x] 2.3 Reproduce macOS Ctrl+K before adoption; cover platform palette toggling and template help/search.
- [x] 2.4 Add live hook preview and axe checks across dark, light and high_contrast.
- [x] 2.5 Run bounded builds, unit tests, lint, typecheck, registry/docs coverage and strict OpenSpec validation.
- [ ] 2.6 Run browser accessibility suites in PR CI (excluded by worker policy).

## 3. Docs and release

- [x] 3.1 Add TSDoc, hook catalog metadata/example and platform-specific palette documentation.
- [x] 3.2 Add one minor changeset for UI and templates, noting the macOS Ctrl+K change.
- [x] 3.3 Regenerate registry output, format and commit locally.

## Public test seams and red evidence

Tests observe exported parser results, document keyboard events and default prevention, rendered hook consumers and shortcut metadata, server markup, and actual palette/template DOM and focus. Only platform and time boundaries are stubbed; no internal collaborators are mocked.

Successive tests failed before each implementation slice. The deterministic command `pnpm --filter @gntik-ai/ui test src/components/CommandPalette/CommandPalette.test.tsx` reproduced Ctrl+K opening the palette on MacIntel before adoption. The confirmed cause was the old metaKey OR ctrlKey condition. The hook now resolves mod through getOs at event time. The template test failed on slash leaving focus on the body before its binding was added.

The GlobalSearch integration test also needs an explicit MacIntel platform for its existing Meta+K scenario. No block runtime code changes. A final regression failed when changing the character switch between scoped sequence steps; the switch now resets only global character sequences, preserving scoped and command bindings.

## Environment limits

The prescribed recursive library test command stops at the unchanged tokens mirror-install test. Without public-registry access, its local fallback packs the current 0.3.0 package but reads gntik-ai-tokens-0.2.1.tgz, producing ENOENT. The remaining token checks pass when that registry-dependent test is excluded. Browser accessibility/visual suites, full application builds, MCP CLI tests and evals tests remain for PR CI under worker policy. No browser suite was launched.

## Final validation

Library builds, lint, monorepo typecheck, registry freshness, docs coverage, both consumer kit-only checks and strict OpenSpec validation pass. All ten library package suites pass in the recursive run excluding tokens, MCP and evals; tokens pass separately with the registry-dependent test excluded. This includes the full UI, blocks and templates suites. The live hook preview, palette and shortcut-dialog tests cover jsdom axe in dark, light and high_contrast; browser contrast/accessibility remains for PR CI. All changed files are formatted, with generated files retaining their generator-owned formatting. Registry generation updates kit-registry.json, both llms files and the affected shadcn bundles/manifest; root registry.json remains unchanged.
