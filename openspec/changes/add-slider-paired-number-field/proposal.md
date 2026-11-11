# Change: Pair Slider with an editable NumberInput

## Why

Issue #177, risk R1. Slider offers a read-only value readout; consumers need to wire a second control themselves for exact entry. Reuse the kit NumberInput with shared values, bounds, naming and isolated Field registration.

## What changes

- Add optional `withInput` and `inputProps` (`unit`, `hideSteppers`, `size`) to Slider; render one input per thumb in a fixed grid row.
- Synchronize slider moves and valid typed changes. Clamp and snap typed values on blur or Enter, restoring empty or unparsable text without callbacks. Prevent range thumbs crossing and respect their minimum step separation.
- Keep the slider as the sole named form control; isolate each NumberInput with a public nested Base UI Field.Root. Preserve label and validation ownership on the outer Field.
- Forward the existing NumberInput spinbutton role and range attributes to its visible input when requested, retaining textbox semantics otherwise.
- Add the live SliderWithInput example, English/Spanish labels, documentation, a minor UI changeset and regenerated registry artifacts.

## Scope and risk

The default Slider rendering and existing slot classes remain unchanged. No PromptEditor changes, custom parsing, marks, thumb value labels, responsive stacking, brand token changes, package version changes or release actions. Narrow-container stacking remains deferred; the fixed grid row ships first. Rollback is a revert or consumer pin to the previous UI minor.

Browser axe in dark, light and high_contrast runs in PR CI under worker policy; unit axe checks the new example in all three themes locally.
