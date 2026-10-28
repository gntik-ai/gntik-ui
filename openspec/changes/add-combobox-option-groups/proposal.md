# Add Combobox option groups

## Why

Combobox lacks group parts and grouped collections bypass its async and creatable behavior. MultiSelect cannot label related options. Searchable groups let consumers organize options without replacing the kit's keyboard and accessibility behavior.

## What Changes

- Export ComboboxGroup, ComboboxGroupLabel, ComboboxSeparator, ComboboxCollection, their props and useComboboxFilter.
- Reuse Select's canonical group label and separator token classes.
- Keep grouped collections working with filtering, async loading and creation. Render Create and Retry after groups, outside labelled groups, with a uniform Base UI collection shape.
- Add optional MultiSelectOption.group. Render ungrouped options first, then groups in first-seen order; Select all spans enabled options across all groups.
- Add live examples, tests, generated registry/docs output and a minor UI changeset.

## Impact

- Capabilities: ui/combobox and ui/multi-select (ADDED; no baseline specs). No dependencies. Risk R1, additive optional API.
- Flat option DOM remains unchanged. Grouped lists retain full rendering even with virtualized enabled.
- No load more, match highlighting, ModelPicker migration, collapsible groups, per-group select all or sticky labels.
- No publishing or deployment. Roll back by reverting the change or pinning the previous kit release.
