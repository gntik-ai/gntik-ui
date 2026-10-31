## 1. Implementation

- [x] Widen ToolCallStatus and export ToolCallDecision; add approval controls outside the header, optional denial reasons, busy state, decision lines, open-on-entry and announcement.
- [x] Add token-only slots, warning and denied icons, English and Spanish catalogs with English fallbacks.
- [x] Document the props, keyboard contract and backend enforcement; demonstrate the states and optional controls in the live example.

## 2. Tests

- [x] Preserve the existing tests and cover approval callbacks, pending actions, reason submission and cancellation, destructive wording, decision records, controlled panels, announcements, focus and Spanish strings.
- [x] Run axe on ToolCallCardStates in all three theme scopes in jsdom; browser contrast and visual suites run in PR CI.

## 3. Release evidence

- [x] Add one changeset for chat minor and ui minor, noting the widened ToolCallStatus union.
- [x] Regenerate registry artifacts and run bounded repository checks and strict OpenSpec validation.

The announcement regression was reproduced with `pnpm --filter @gntik-ai/chat test src/ToolCallCard/ToolCallCard.test.tsx`: both initial approval and entry from running committed the live region with its text already present. The regression tests observe the public DOM before passive effects, verifying an empty region first and the same node receiving the message afterward, including on re-entry. The fix defers the announcement to a post-commit effect and preserves the legacy DOM and focus behavior.

The combined library test command cannot complete offline: the untouched tokens mirror test falls back to packing version 0.3.0 but tries to read a 0.2.1 tarball (ENOENT). PR CI must rerun that integration check with network access. Browser accessibility/contrast and visual suites, app builds and MCP/evals tests run in PR CI under worker policy.
