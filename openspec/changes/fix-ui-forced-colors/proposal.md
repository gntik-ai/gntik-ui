# Keep UI state visible in forced colours

## Why

Operating system forced colours replace backgrounds and remove shadows. Checked switches,
radio choices, active tabs, fills and tinted selections consequently lose their state markers.

## What Changes

- Add only `forced-colors:` system-colour fallbacks to the scoped UI variants.
- Preserve normal-theme classes and Switch geometry; do not change tokens or brand colours.
- Document the fallback rule, demonstrate static tab markers, and add unit, compiler and browser coverage.
- Regenerate the registry and add a patch changeset for `@gntik-ai/ui`.

## Impact

- Affected capability: `ui/forced-colors`.
- Affected package: `@gntik-ai/ui`.
- Blocks, templates, charts, chat and flow remain outside this change.
- Browser validation runs in PR CI. Rollback is a revert or a pin to the previous UI patch.
