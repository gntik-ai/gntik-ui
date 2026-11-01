# Change: Add shared keyboard shortcuts

## Why

Kit consumers need combinations, sequences and a shortcut-sheet registry without separate document listeners. The command palette accepts Ctrl+K on macOS, and the keyboard-shortcuts template advertises help and search keys that are not bound.

## What changes

- Add useHotkeys, useRegisteredHotkeys, setCharacterHotkeysEnabled and typed definitions to the root @gntik-ai/ui export. Keep parsing, registry and React hooks separate.
- Match exact modifiers, platform mod at event time through getOs, symbol Shift and physical codes on non-Latin/Option input.
- Share one document listener with sequence timing, scope precedence, typing/modal/IME/repeat/default-prevention guards and stable external-store snapshots.
- Adopt mod+key in useCommandPaletteShortcut without changing its signature; bind help and search in the keyboard-shortcuts template.
- Add catalog documentation and a live hook preview, tests, regenerated registries and one minor changeset covering UI and templates.

## Scope and risk

Issue #136, risk R1. Depends on fix-ui-use-os, present at the assigned base. No new dependencies, deployment or publishing. No hooks subpath exists at implementation time, so only the root UI export changes. Pressed state, hold actions, remapping, roving focus, row navigation, F6 and a settings screen remain outside scope. Apps can expose the character-shortcut switch through their own state. A single binding sharing a sequence prefix fires immediately and logs one development warning while the conflict remains mounted. On macOS/iOS, Ctrl+K no longer opens the palette. Rollback is a revert or a previous UI/templates version pin.
