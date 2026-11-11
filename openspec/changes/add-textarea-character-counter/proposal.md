# Change: Add optional character counters to Textarea and Input

## Why

Consumers rebuild character counters without accessible descriptions or polite limit warnings.

## What changes

- Add optional showCount, maxCount and countStrategy props to Textarea and Input.
- Keep native maxLength, support soft limits and custom counting, and expose localized descriptions and debounced threshold announcements.
- Show counters below Textarea and inside Input before trailing addons, preserving default markup and clear-button behavior.
- Add live examples, regression coverage, generated registry output and one minor changeset for @gntik-ai/ui.

## Scope and risk

Issue #180, R1, base 51e15ee7. Capabilities: ui/textarea and ui/input. No dependencies. Excludes Textarea addons, ChatComposer migration, wrapper APIs and default grapheme counting. Rollback is a revert or a previous kit version. No publishing or deployment.
