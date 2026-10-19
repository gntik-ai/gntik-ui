## Purpose

UserMenu: account menu with an avatar trigger, a user header, action and link items, an optional theme submenu and sign out.

## ADDED Requirements

### Requirement: Two-line trigger shows the name and the e-mail

With `showEmail`, the UserMenu trigger SHALL render the avatar, the user's name above the e-mail and a trailing chevron, fill its container's width and truncate overflowing text. If the user has no e-mail, it SHALL omit the e-mail line while retaining the name and chevron.

#### Scenario: Sidebar footer

- **GIVEN** a user Ana López with e-mail ana@example.test in a 248px sidebar footer
- **WHEN** UserMenu renders with `showEmail`
- **THEN** the trigger shows Ana López above ana@example.test
- **AND** it is as wide as the footer

#### Scenario: Long e-mail

- **WHEN** the account e-mail exceeds the footer's width
- **THEN** both text elements truncate inside a min-w-0 column without horizontal overflow

### Requirement: Two-line trigger keeps the account name in its label

The two-line trigger MUST keep the catalog's `userMenu.label` accessible name, which contains the visible user name. An explicit triggerLabel MUST take precedence.

#### Scenario: Spanish catalog

- **WHEN** the trigger renders with `showEmail` inside an I18nProvider with locale `es`
- **THEN** its accessible name is Menú de la cuenta de Ana López

### Requirement: Existing account menu behavior is preserved

Without showEmail, UserMenu SHALL preserve its existing trigger DOM and classes for both showName values. With showEmail, it SHALL retain keyboard opening, Escape focus restoration and collision flipping.

#### Scenario: Collapsed rail

- **WHEN** the example's sidebar collapses to a rail
- **THEN** its footer disables showEmail and shows the avatar-only trigger
