## Purpose

Shared semantic tones of @gntik-ai/tokens: data-tone sets tone, tone-text and tone-chip-text variables that kit and product components use instead of per-component tone tables.

## ADDED Requirements

### Requirement: data-tone sets the tone variables from existing tokens

tone.css SHALL set `--tone`, `--tone-text` and `--tone-chip-text` for each supported `data-tone` value, and every value MUST be a reference to an existing brand token or pairing alias.

#### Scenario: Warning tone

- **WHEN** an element has `data-tone="warning"`
- **THEN** `--tone` resolves to `--warning`
- **AND** `--tone-chip-text` resolves to `--warning-chip-text`

#### Scenario: Unknown tone

- **WHEN** an element has `data-tone="purple"`
- **THEN** no tone variable is set
- **AND** `bg-tone/15` paints no tint

### Requirement: Tone text pairs meet AA on surfaces and tints

For every tone and theme, `--tone-text` SHALL meet 4.5:1 on the background, card and popover surfaces, and `--tone-chip-text` SHALL meet 4.5:1 on its tone's 10-20% tint over those surfaces.

#### Scenario: Chip text on a tint

- **WHEN** the tokens test checks `success` in the light theme
- **THEN** `--tone-chip-text` on a 15% success tint over the card is at least 4.5:1

### Requirement: Display components render their tones through data-tone

Badge, Alert, Token and Progress SHALL set `data-tone` on their root and take tone colours from the shared utilities instead of per-tone colour classes.

#### Scenario: Progress tone

- **WHEN** a Progress renders with `tone="destructive"`
- **THEN** its root has `data-tone="destructive"`
- **AND** the indicator computes the same colour as on origin/main
