# Tasks

## 1. Implementation

- [x] 1.1 Add the optional variant axis and resolve props across the nine field control families, including shared chips and range triggers.
- [x] 1.2 Export FieldVariantProvider and useFieldVariant without colliding with FieldVariantProps.
- [x] 1.3 Preserve focus, errors, disabled/read-only states and forced-colors boundaries.

## 2. Tests

- [x] 2.1 Exercise alternate chrome and state semantics through rendered controls, red before green.
- [x] 2.2 Check provider precedence, nested providers and byte-identical default slots against the immutable base.
- [x] 2.3 Check filled-field foreground and placeholder contrast in every theme.
- [ ] 2.4 Run browser axe on live examples in all three themes in PR CI.

## 3. Docs and release

- [x] 3.1 Show ghost inline editing and filled toolbar examples and all affected controls; localize preview labels.
- [x] 3.2 Add a minor changeset for @gntik-ai/ui.
- [x] 3.3 Regenerate the kit registry and llms output and run bounded repository checks.
- [x] 3.4 Validate this OpenSpec change strictly.

## Worker handoff

- Browser axe, visual and app builds run in PR CI by policy. Structural axe on the new previews and three-theme filled contrast checks run locally.
- The tokens mirror-install check cannot complete without the public registry: its offline fallback expects gntik-ai-tokens-0.2.1.tgz, which is absent after packing the current package version. Rerun it in PR CI.
