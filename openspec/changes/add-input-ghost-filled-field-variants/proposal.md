# Shared field chrome variants

## Why

The field controls repeat a bordered, recessed appearance. Inline-edit rows and toolbars need transparent or filled fields that preserve focus, errors and disabled/read-only feedback.

## What changes

- Add optional `variant="outline" | "filled" | "ghost"` to Input, Textarea, NumberInput, SelectTrigger, SimpleSelect, ComboboxInput (including its chips field), MultiSelect, TokenInput, DatePicker, DateRangePicker, DateTrigger and TimePicker.
- Export FieldVariantProvider, useFieldVariant, FieldControlVariant and FieldVariantProviderProps. Explicit props override the nearest provider, then outline is the default. The existing FieldVariantProps export stays intact.
- Filled uses bg-secondary, border-transparent and shadow-none. Ghost uses bg-transparent, border-transparent, shadow-none and hover:bg-secondary/50. Focus and invalid borders remain visible; alternate chrome gets a forced-colors system border.
- Preserve default slot class strings, existing snapshots and markup fixtures. Add rendered-control, precedence, state and frozen-token contrast checks.
- Show inline editing and toolbar use on the Input page and alternate chrome on every affected control page. Translate preview labels to English and Spanish.
- Include a minor changeset for @gntik-ai/ui and regenerate the registry and llms output.

## Scope and risk

Risk R2: shared context and nine control families. Default classes remain byte-identical, guarded against the immutable base. Token values and dependencies stay unchanged. Form/Fieldset shortcuts, block adoption, size changes, underlined chrome and other controls are excluded. Roll back by reverting or pinning the previous UI release. No deployment or data migrations.

Capability: ui/input. All deltas are ADDED; no baseline specs exist. No dependencies on other OpenSpec changes.
