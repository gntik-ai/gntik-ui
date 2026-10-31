## Purpose

Dropdown menu of actions or options: items with icon, shortcut hint and destructive tone, checkbox and radio items, groups, separators, submenus and the MoreMenu row-actions shorthand.

## ADDED Requirements

### Requirement: Link items render real anchors through the router link

MenuLinkItem SHALL render an anchor with the given href and the menuitem role, rendered through the nearest LinkProvider component when one is set and the item is not external, and as a plain anchor otherwise. A caller render SHALL override both. MenuLinkItem SHALL use the MenuItem icon, label and shortcut slots and item styling, plus no-underline, and support destructive styling.

#### Scenario: With a router link

- **GIVEN** a LinkProvider whose component records the props it receives
- **WHEN** a menu with `<MenuLinkItem href="/runs/42">Open run</MenuLinkItem>` opens
- **THEN** the router component received href `/runs/42`
- **AND** the element has the menuitem role

#### Scenario: Without a provider

- **WHEN** the same item renders with no LinkProvider
- **THEN** it is an a element with href `/runs/42`

#### Scenario: Caller render

- **GIVEN** a LinkProvider is set
- **WHEN** a link item has a caller render
- **THEN** the caller element is used instead of the provider component

### Requirement: Activating a link item follows it and leaves modifier clicks to the browser

ArrowDown SHALL highlight MenuLinkItem like other menu items. Enter or a plain click SHALL follow its link and close the menu by default. closeOnClick false SHALL keep the menu open. Clicks with Ctrl, Meta or Shift and middle-button clicks MUST NOT be prevented, so the browser can open the link in a new tab or window.

#### Scenario: Enter follows the link

- **GIVEN** the link item is highlighted
- **WHEN** the user presses Enter
- **THEN** the link is followed
- **AND** the menu closes

#### Scenario: Modifier clicks

- **WHEN** the user Ctrl, Meta or Shift clicks the item, or middle-clicks with auxclick
- **THEN** the click event is not default-prevented

#### Scenario: Keep open

- **GIVEN** a link item with closeOnClick false
- **WHEN** the user clicks it
- **THEN** the menu remains open

### Requirement: External link items open in a new tab and say so

A MenuLinkItem with external SHALL set target to `_blank` and rel to `noopener noreferrer`, show the external icon and append the catalog's visually hidden new-tab text, and MUST NOT render through the router link.

#### Scenario: External documentation link

- **GIVEN** a LinkProvider is set
- **WHEN** `<MenuLinkItem external href="https://docs.example.test">Docs</MenuLinkItem>` renders
- **THEN** it is a plain anchor with target `_blank`
- **AND** its accessible name ends with `(opens in a new tab)`, or `(se abre en una pestaña nueva)` under es

### Requirement: MoreMenu actions with an href render link items

MoreMenu SHALL render an action that has href as a MenuLinkItem that also calls the action's onSelect, and a disabled action with href as a disabled non-anchor menu item. MoreMenuAction SHALL support external links. Actions without href MUST render as before. DataTable rowActions SHALL inherit navigation support without changes to the block implementation.

#### Scenario: Row action link

- **GIVEN** MoreMenu items `[{ label: 'View logs', href: '/logs?run=42' }, { label: 'Restart' }]`
- **WHEN** the menu opens
- **THEN** View logs is an anchor with href `/logs?run=42`
- **AND** Restart remains an action menu item

#### Scenario: Disabled navigation

- **GIVEN** an action with href and disabled
- **WHEN** MoreMenu opens
- **THEN** the action is a disabled non-anchor menu item

### Requirement: Shared menu links preserve compatibility

UserMenu SHALL reuse MenuLinkItem while preserving its existing href DOM, including its enabled behavior when href and disabled are combined. MenuLinkItem SHALL work in ContextMenu. Docs SHALL reserve link items for navigation and state that router adapters forward ref, role and event handlers. MenuLinks and the changed examples SHALL have no axe violations in dark, light and high_contrast.

#### Scenario: Context menu navigation

- **WHEN** a ContextMenu containing MenuLinkItem opens
- **THEN** the item is an anchor with the menuitem role and its given href

#### Scenario: Existing actions

- **WHEN** MoreMenu or UserMenu renders actions without href
- **THEN** the DOM remains unchanged from source SHA 05d05b8
