# Slider marks and labels

## Why

Named stops and uneven tiers make slider values easier to understand. Numeric step alone cannot express uneven mark spacing.

## What Changes

- Add optional numeric or string-labelled marks for single and range sliders, including paired inputs and both sizes.
- Draw decorative ticks and measured, contained labels using logical positioning; announce matching labels through thumb value text.
- Add restrictToMarks for keyboard navigation only. Pointer and touch dragging retain Base UI's continuous step behaviour and event details (operator option A, 2026-11-18).
- Keep one controllable value owner, native form validity and the pinned no-marks DOM.
- Add translated examples, keyboard documentation and a minor UI changeset.

## Impact

- Affected capability: ui/slider (all requirements added; no baseline specification exists).
- Affected source: Slider, its styles, tests, example, i18n catalogs and generated registry/docs.
- No pointer snapping, new tokens, vertical styling, custom renderers or product integrations.
