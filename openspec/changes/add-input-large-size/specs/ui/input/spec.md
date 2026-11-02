## Purpose

Input compositions: password and secret controls, keyboard hints and icon-button addons that match the field size.

## ADDED Requirements

### Requirement: Controls inside a large Input scale with it

At size lg, PasswordInput and SecretField SHALL render 44px fields with 36px reveal/copy controls and 17px icons. PasswordInput strength text SHALL be 13px. InputKbd SHALL be 22px, and implicit icon-button addons SHALL use md. Explicit addon sizes SHALL win over context. All other sizes and standalone addons SHALL keep their existing metrics.

#### Scenario: Large password field

- **WHEN** a PasswordInput renders at lg
- **THEN** the field is 44px and the reveal toggle is 36px with a 17px icon
- **AND** the toggle retains its accessible show/hide name and aria-pressed state
- **AND** strength text is 13px

#### Scenario: Default size

- **WHEN** a PasswordInput renders without size or at auto, sm or md
- **THEN** its toggle remains 28px and its strength text remains 12px

#### Scenario: Large secret field

- **WHEN** a SecretField renders at lg with a Rotate action
- **THEN** reveal and copy buttons are md (36px) and Rotate is lg (44px)
- **AND** sm still uses 24px actions and auto/md retain their existing metrics

#### Scenario: Contextual addons

- **WHEN** InputKbd and implicit IconButton or icon CopyButton addons render inside an lg Input
- **THEN** the chip is 22px and the buttons are 36px
- **AND** explicit button sizes override context

#### Scenario: Non-large and standalone addons

- **WHEN** addons render outside an Input or inside an auto, sm or md Input
- **THEN** the keyboard chip remains 18px and implicit buttons retain auto sizing
