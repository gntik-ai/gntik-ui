# Tasks

## 1. Implementation

- [x] 1.1 Add the optional variant axis and resolve props across the nine field control families, including shared chips and range triggers.
- [x] 1.2 Export FieldVariantProvider and useFieldVariant without colliding with FieldVariantProps.
- [x] 1.3 Preserve focus, errors, disabled/read-only states and forced-colors boundaries.

## 2. Tests

- [x] 2.1 Exercise alternate chrome and state semantics through rendered controls, red before green.
- [x] 2.2 Check provider precedence, nested providers and byte-identical default slots against the immutable base, including rendered read-only and disabled outline controls and internal picker popup chrome.
- [x] 2.3 Check filled-field foreground and placeholder contrast in every theme.
- [ ] 2.4 Run browser axe on live examples in all three themes in PR CI.

## 3. Docs and release

- [x] 3.1 Show ghost inline editing and filled toolbar examples and all affected controls; localize preview labels.
- [x] 3.2 Add a minor changeset for @gntik-ai/ui.
- [x] 3.3 Regenerate the kit registry and llms output and run bounded repository checks.
- [x] 3.4 Validate this OpenSpec change strictly.

## Worker handoff

- Browser axe, visual and app builds run in PR CI by policy. Structural axe on the new previews and three-theme filled contrast checks run locally.
- The other 12 token test files pass locally. The mirror-install check needs PR CI: without registry access, its offline fallback packs version 0.3.0 but tries to read the missing gntik-ai-tokens-0.2.1.tgz (ENOENT).

## CI repair handoff

- The new TimePicker variant preview sorted after the clearable preview, changing the last hours segment targeted by the existing browser contract. Rename the new preview to TimePickerChromeVariants so the clearable preview stays last. A catalog-order interaction regression failed before the rename and passes afterward; no existing browser assertion was changed.
- For the filter high-contrast keyboard trace, an isolated comparison of Select from immutable base 7f9f7d1f3ab12b4e21992c8e417b45601389d68b and the current source confirmed that both append the same hidden Saved option text after focusing a closed trigger. Base UI schedules this lazy mount with a zero-delay timer; the CI helper reads raw body text when focus cycles to the body. No filter behavior change is justified by that timing difference. Rerun the existing browser check in PR CI; the temporary comparison harness was removed.
