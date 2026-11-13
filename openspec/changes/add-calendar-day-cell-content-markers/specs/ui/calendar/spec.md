## Purpose

Calendar: an accessible month grid for picking a day or a range, with keyboard navigation, locale-aware names, min/max and disabled dates, used inline and inside the date pickers.

## ADDED Requirements

### Requirement: Day markers render as tone-token dots on in-month days

When `getDayMarkers` or `highlightedDates` yield markers for an in-month day, the Calendar SHALL render up to three dots for them, coloured only by tone tokens, and SHALL switch the dots to the primary-foreground token on the selected day. Outside days MUST NOT render markers.

#### Scenario: Failed run day

- **GIVEN** `getDayMarkers` returns a destructive marker labelled `2 failed runs` for 2026-03-03
- **WHEN** March 2026 is shown
- **THEN** the March 3 button holds one dot with the `bg-destructive` class
- **AND** no other day holds a dot

#### Scenario: Selected day keeps its dots visible

- **GIVEN** March 3 has a primary marker
- **WHEN** the user selects March 3
- **THEN** the day is filled with the primary token
- **AND** its dot uses `bg-primary-foreground`

#### Scenario: More markers than dots

- **WHEN** a day has four markers
- **THEN** three dots are drawn

### Requirement: Marker labels extend the day accessible name

Each in-month day button SHALL be named by its locale day label followed by its marker labels, in order and comma-separated, and the marker dots MUST be hidden from assistive technology.

#### Scenario: Announced marker

- **GIVEN** locale `en-US` and a marker labelled `2 failed runs` on 2026-03-03
- **WHEN** focus moves to March 3
- **THEN** the button is announced as `Tuesday, March 3, 2026, 2 failed runs`

#### Scenario: Highlighted date in Spanish

- **GIVEN** locale `es-ES` inside an I18nProvider
- **AND** `highlightedDates` contains 2026-03-10
- **WHEN** focus moves to March 10
- **THEN** the accessible name ends with `Destacado`

### Requirement: Loading state keeps the calendar operable

While `loading` is true the Calendar SHALL mark each grid busy, show a loading indicator and not draw markers, and it MUST keep keyboard navigation and selection working.

#### Scenario: Month data loading

- **GIVEN** `loading` is true
- **WHEN** the user presses ArrowRight and then Enter
- **THEN** focus moves to the next day and that day is selected
- **AND** each grid has `aria-busy` set to true
- **AND** no marker dots are drawn

#### Scenario: Data arrives

- **GIVEN** focus is on March 12 while `loading` is true
- **WHEN** `loading` becomes false
- **THEN** the markers are drawn
- **AND** focus stays on March 12

### Requirement: Custom day content stays decorative

When `renderDay` is set, the Calendar SHALL render its output in place of the day number and dots inside an element hidden from assistive technology, and MUST keep the day button's data-day attribute, roving tabindex, key handling and accessible name.

#### Scenario: Count badge

- **GIVEN** `renderDay` returns the day number and a run count of 3
- **WHEN** the grid renders
- **THEN** the count is inside an `aria-hidden` wrapper
- **AND** the button keeps `data-day` and its accessible name

### Requirement: Date pickers forward marker props and month changes

DatePicker and DateRangePicker SHALL forward `getDayMarkers`, `highlightedDates`, `highlightedLabel`, `loading`, `renderDay` and `onMonthChange` to the Calendar in their popup.

#### Scenario: Paging in a DatePicker

- **GIVEN** a DatePicker with `onMonthChange` and `getDayMarkers`, open on March 2026
- **WHEN** the user presses PageDown
- **THEN** `onMonthChange` is called with 2026-04-01
- **AND** the markers returned for April render in the popup calendar
