# Add SearchableSelect and popup-search Combobox parts

## Why

Toolbar and console pickers need a reusable button trigger with a search field in its popup. Combobox currently places the input in the field; WorkspaceSearch builds a private workspace-specific implementation.

## What Changes

- Add SearchableSelect on the existing kit Combobox root, with flat/grouped options, typed single/multiple values, localized counts, native form values, custom triggers, persistent action rows and optional flat-list virtualization.
- Add optional ComboboxTrigger, ComboboxPopupInput and ComboboxContent header/footer slots without changing existing compositions.
- Rebuild WorkspaceSearch on the shared picker while retaining workspace labels, matching and presentation.
- Add localized examples, keyboard/form/axe tests, registry output and one minor ui changeset.

## Impact

- Capabilities: ui/searchable-select and ui/combobox. All deltas are ADDED.
- Depends on add-select-virtualized-option-lists, already present at the assigned snapshot.
- R1 additive public API. Rollback is a revert or pinning the previous package release.
- No ModelPicker, FilterBar, Menu search, inline ListBox, async grouped loading, grouped windowing, option creation, field chips, automatic virtualization threshold or searchable=false mode.
- No deployment, publishing or release/version changes.
