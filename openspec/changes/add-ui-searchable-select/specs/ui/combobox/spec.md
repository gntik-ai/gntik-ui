## Purpose

Composable Combobox parts supporting a field-style or custom button trigger with search inside the popup.

## ADDED Requirements

### Requirement: Combobox supports popup search and optional header and footer slots

Combobox SHALL offer ComboboxTrigger using Select trigger styles and sizes auto, sm, md and lg, with a render prop for custom buttons. ComboboxPopupInput SHALL provide a search icon, localized search input and shared virtualized keyboard navigation. ComboboxContent SHALL accept optional header and footer ReactNode slots around status/empty/list content in both normal and windowed branches. Existing compositions with neither slot MUST retain identical output. The parts SHALL be exported and shown in live documentation.

#### Scenario: Open from the trigger

- **GIVEN** a Combobox with ComboboxTrigger and a header containing ComboboxPopupInput
- **WHEN** Enter, Space or ArrowDown is pressed on the trigger
- **THEN** the popup opens with focus in the search input
- **AND** typing filters options and a supplied footer remains after the list
