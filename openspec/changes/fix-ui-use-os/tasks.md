# Tasks

## 1. Implementation

- [x] 1.1 Add Os, getOs and useOs with public exports and TSDoc.
- [x] 1.2 Resolve mod in Kbd and announce Ctrl using kbd.control, preserving label overrides and stable combo keys.
- [x] 1.3 Default CommandPaletteTrigger to mod and K without changing bindings.
- [x] 1.4 Adopt mod in GlobalSearch and keyboard-shortcuts data; pass useOs to the compatible filter helper.

## 2. Tests

- [x] 2.1 Reproduce the Windows trigger bug before source edits.
- [x] 2.2 Cover platform detection, client rendering, SSR navigator isolation and hydration.
- [x] 2.3 Cover modifier rendering, spoken names, explicit glyphs and label precedence.
- [x] 2.4 Cover Linux GlobalSearch and shortcut sheet rendering/search, and legacy filter callers.
- [x] 2.5 Add a browser axe regression for the Kbd example in all three themes.
- [ ] 2.6 Complete repository gates and browser a11y; PR CI must finish the sandbox-blocked checks below.

## 3. Docs and release

- [x] 3.1 Document useOs/mod in Kbd docs and its live example.
- [x] 3.2 Add one patch changeset covering UI, blocks and templates.
- [x] 3.3 Regenerate kit-registry.json, registry.json and llms output.
- [x] 3.4 Validate fix-ui-use-os with OpenSpec strict validation.

## Sandbox validation limits

Browser a11y cannot start Vite preview: listen EPERM on ::1:4173. The token mirror-install integration test cannot bind its local mirror: listen EPERM on 127.0.0.1. These checks require PR CI. Visual baselines remain an operator/CI responsibility.

The required library test command stops at that mirror test, so it does not verify later packages. Broad follow-up Vitest runs exceeded sandbox memory, killed the concurrent lint process and produced test timeouts; they do not establish a full suite pass. Sequential reruns pass lint, the 46 useOs/Kbd/CommandPalette tests and all three settings-profile fixture/mode tests. The settings-profile DOM fixture now expects Ctrl/Control, matching the default trigger on Linux. Kbd example accessibility tests restore the previous root theme class. Library build, complete typecheck, registry regeneration/checks, docs coverage, OpenSpec validation and both kit-only checks pass. The full library command and browser a11y remain PR CI checks.
