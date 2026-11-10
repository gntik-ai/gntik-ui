# Show and expose invalid form controls

## Why

Outline Select and Combobox fields lack the destructive border that Input shows. Select and SimpleSelect do not expose an explicit invalid state, and SimpleSelect drops FormField aria-invalid at its renderless root. Switch and Slider also lack explicit invalid states.

## What changes

- Add optional invalid props to SelectTrigger, SimpleSelect, ComboboxInput, ComboboxChipsInput, Switch and Slider. Explicit aria-invalid takes precedence; omitted state adds no attributes. Preserve Base UI Field state.
- Share invalid borders across Select and Combobox variants; preserve Select borders on hover, keyboard focus and popup open. Add a 1px destructive Switch ring and destructive Slider thumb borders.
- Add localized live examples and require a FieldError or description alongside invalid controls. Add public DOM, form, variant and browser regression coverage.
- Ship a minor @gntik-ai/ui changeset and regenerate the registry and llms output.

## Scope and risk

Change id: add-select-invalid-state-styling. Capabilities: ui/select, ui/combobox, ui/switch, ui/slider. ADDED only; no baseline exists. Depends on none. R1: additive props and invalid-only styling; rollback is a revert or previous package pin. No token changes, validation timing changes, other picker changes, publishing, merging or deployment. Browser a11y, computed styles, contrast and visual baselines are verified in PR CI.
