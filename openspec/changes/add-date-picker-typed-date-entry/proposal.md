# Editable DatePicker triggers

## Why

Read-only picker triggers cannot accept a known date from the keyboard or clipboard.

## What changes

- Add opt-in editable DatePicker and DateRangePicker triggers using locale-ordered DateField segments and a Choose date button.
- Synchronize typing, paste, calendar selection, preview months and focus in place, including controlled rejections.
- Support date-time entry with explicit 12-hour periods and zone-safe wall times; add UTC DateField and DateRangeField submission.
- Use year-safe date construction, comparison and range spans across calendar paths.
- Split message catalogs, add English/Spanish labels, live examples and regression tests.

## Impact

Additive minor release of @gntik-ai/ui. The default read-only trigger is unchanged. Depends on add-ui-date-field. No deployment or publishing. Roll back by reverting or pinning the prior package release.
