## Purpose

Cursor tokens of @gntik-ai/tokens: one interactive and one disabled cursor that every kit control applies, switchable with one variable override.

## ADDED Requirements

### Requirement: Controls read the interactive and disabled cursor tokens

Kit controls SHALL set their cursor through `cursor-interactive` when enabled and `cursor-disabled` when disabled, and component variants MUST NOT use literal cursor classes for these states.

#### Scenario: Enabled and disabled checkbox

- **WHEN** a user hovers an enabled and a disabled Checkbox
- **THEN** the enabled one computes `cursor: pointer`
- **AND** the disabled one computes `cursor: not-allowed`

### Requirement: One override switches the cursor policy

Setting `--cursor-interactive` on `:root` SHALL change the cursor of every enabled kit control, without changing the disabled cursor.

#### Scenario: Arrow policy

- **GIVEN** `:root { --cursor-interactive: default }`
- **WHEN** a user hovers a Button and a Tab
- **THEN** both compute `cursor: default`
