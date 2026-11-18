## Purpose

Slider is a single value or range picker on Base UI, with visible and per-thumb labels, a readout, two sizes and optional paired inputs, supporting Field and Form.

## ADDED Requirements

### Requirement: Marks draw ticks and labels at their value positions

Slider SHALL draw decorative, aria-hidden ticks for in-range marks at their logical inline-start percentages. Labelled marks SHALL show aria-hidden labels below the track. Label offsets SHALL clamp tick offset minus half label width to the track bounds, measured with ResizeObserver. Before measurement the first and last labels SHALL align to the logical start and end. Direction SHALL follow the root's computed direction. The documentation SHALL recommend about five labels or fewer.

#### Scenario: Temperature presets

- **GIVEN** marks Precise at 0, Balanced at 1 and Creative at 2 on a 0–2 slider
- **WHEN** the slider renders
- **THEN** the ticks sit at 0%, 50% and 100% with their labels beneath
- **AND** marks outside the bounds are omitted

#### Scenario: Right to left and narrow tracks

- **WHEN** the slider renders inside a plain RTL wrapper at 240px wide
- **THEN** Precise is at the right end
- **AND** the first and last labels remain within the track without horizontal page overflow

### Requirement: Restricting to marks affects keyboard navigation only

With restrictToMarks, Arrow, Shift+Arrow and Page keys SHALL move the focused thumb to the adjacent mark, with horizontal arrows mirrored in RTL. Home and End SHALL move to the first and last permitted mark. A pure snapToMarks function SHALL keep sorted thumbs at least minStepsBetweenValues marks apart, retaining the current value if no mark qualifies. Each accepted keyboard change SHALL emit one change and one commit with Base UI's own event details. Slider SHALL preserve pointer and touch behaviour, numeric step, values, events and details without snapping.

#### Scenario: Uneven tiers by keyboard

- **GIVEN** marks 0, 0.2, 1 and 2 at value 0.2
- **WHEN** Arrow Right or Page Up is pressed in LTR
- **THEN** the value is 1 and one change and commit are emitted
- **AND** Arrow Left returns to 0.2, Home chooses 0 and End chooses 2

#### Scenario: Range spacing

- **GIVEN** marks 1, 2, 4, 8, 16, values [2, 8] and a one-mark minimum gap
- **WHEN** the first thumb moves forward twice
- **THEN** it moves to 4 once and stays at [4, 8] on the second key

#### Scenario: Continuous pointer parity (option A)

- **GIVEN** matching plain and restrictToMarks sliders with the same step
- **WHEN** the same pointer drag runs on both
- **THEN** their values, changes, commits and Base UI event details match exactly
- **AND** values between marks remain possible

### Requirement: Labelled marks are announced in value text

Slider SHALL announce a matching labelled mark as its label followed by a comma and formatted value; other values SHALL retain their formatted value text.

#### Scenario: On and between marks

- **WHEN** the value equals the Balanced mark at 1
- **THEN** aria-valuetext is Balanced, 1
- **WHEN** it moves to 1.3
- **THEN** aria-valuetext is 1.3

### Requirement: Marks preserve state, native validity and default output

Slider SHALL use one controllable state owner irrespective of marks. Adding or removing marks SHALL preserve the value and control mode. Unsorted default ranges SHALL be normalized for editing. Without marks or with empty marks, the DOM and generated ids SHALL match the pinned base output. With restrictToMarks, native inputs SHALL use step any without rounding marks. Base UI SHALL retain ownership of event details and Field-resolved names.

#### Scenario: Long decimals and range form submission

- **GIVEN** a restricted slider at mark 0.1234567 or range [2, 8]
- **WHEN** the containing form submits
- **THEN** submission succeeds without stepMismatch and preserves the exact values

#### Scenario: Changing marks without resetting values

- **WHEN** marks are added, emptied or removed after editing a slider
- **THEN** its current value, input identity and controlled mode remain stable
