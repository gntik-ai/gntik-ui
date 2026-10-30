# Shared semantic tone utilities

## Why

Badge, Alert, Token and Progress repeat semantic colour maps. Product markup needs the same shared tones without copying those maps.

## What Changes

- Add ten data-tone mappings and Tailwind tone colour utilities from existing tokens.
- Migrate the four display components while preserving every role override and opacity.
- Test token mappings, AA contrast, root attributes and computed colour equivalence in all three themes.
- Document the public API and ship a tokens minor and UI patch.

## Impact

- Affected specs: tokens/tone-utilities (ADDED).
- Affected code: packages/tokens, four packages/ui components, docs and generated registries.
- No existing token values, public prop types or visual baselines change.
