## ADDED Requirements

### Requirement: Switch shows its checked state in forced colours

Under forced colours the Switch track SHALL have a visible inset 1px ButtonBorder outline,
SHALL be painted Highlight when checked and Canvas when unchecked, and its thumb SHALL be
painted ButtonText (unchecked) or HighlightText (checked), without changing the track size.
Disabled outlines and thumbs SHALL use GrayText.

#### Scenario: Checked switch

- **GIVEN** forced colours are active
- **WHEN** a Switch is checked
- **THEN** its track computes to Highlight and its thumb to HighlightText

#### Scenario: Unchecked switch

- **GIVEN** forced colours are active
- **WHEN** a Switch is unchecked
- **THEN** its track shows an inset ButtonBorder outline and its thumb computes to ButtonText
- **AND** the track size and thumb travel remain unchanged

### Requirement: Checked radio keeps a visible dot in forced colours

A checked RadioGroup radio SHALL render a HighlightText dot on a Highlight circle.
Disabled radios SHALL use GrayText. A checked card item SHALL have a 2px Highlight border.

#### Scenario: Radio choice

- **GIVEN** forced colours are active and a RadioGroup contains checked and unchecked options
- **WHEN** the group renders
- **THEN** the checked radio shows a HighlightText dot on Highlight
- **AND** the unchecked radio is an empty circle with a visible border
- **AND** a checked card item has a 2px Highlight border

### Requirement: Active tab keeps a marker in forced colours

The active tab SHALL carry a Highlight marker in underline and pills variants, both with
sliding indicators and with indicator=false. Inactive tabs SHALL carry no Highlight marker.

#### Scenario: Pill tabs

- **GIVEN** forced colours are active and pill tabs have an active tab
- **WHEN** the tabs render
- **THEN** the active tab has a 2px Highlight border marker
- **AND** inactive tabs have no border marker

#### Scenario: Static underline

- **GIVEN** forced colours are active
- **WHEN** underline tabs render with indicator=false
- **THEN** only the active tab shows a Highlight bottom border
- **AND** inactive bottom borders compute to Canvas

### Requirement: Fill-only indicators stay visible in forced colours

Progress, Meter and Slider tracks SHALL have a CanvasText inset outline and a Highlight fill.
Separator lines and StatusDot dots SHALL use CanvasText. StatusDot pings SHALL be hidden.

#### Scenario: Quota meter

- **GIVEN** forced colours are active
- **WHEN** a Meter shows 60 of 100
- **THEN** the track has a CanvasText outline and a Highlight fill covering 60 percent
- **AND** the value text is unchanged

### Requirement: Selected and highlighted items use system selection colours

Selected Table rows, pressed ToggleGroup items, selected Calendar days and highlighted or
selected options in Select, Menu, Combobox, CommandPalette, VirtualList and TransferList
SHALL render Highlight backgrounds with HighlightText text.

#### Scenario: Keyboard through a menu

- **GIVEN** forced colours are active and a Menu is open
- **WHEN** keyboard navigation highlights an option
- **THEN** that option renders Highlight with HighlightText
- **AND** unhighlighted options keep their native system colours

### Requirement: Forced-colour rules do not change the default rendering

Every added styling rule MUST be scoped to the forced-colors active media query.
Existing ordinary classes MUST remain byte-identical. System colours MUST compile to
colour declarations and survive merging with ordinary consumer classes.

#### Scenario: Normal colours

- **GIVEN** forced colours are inactive
- **WHEN** catalog visual and axe tests run in dark, light and high_contrast themes
- **THEN** existing rendering and accessibility results are unchanged
