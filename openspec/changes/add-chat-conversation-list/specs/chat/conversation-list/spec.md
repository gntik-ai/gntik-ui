## Purpose

Presentational conversation history with recency groups, roving focus, row menus, unread counts, creation and incremental loading. Conversation state and persistence belong to the application.

## ADDED Requirements

### Requirement: Conversations group by local recency

ConversationList SHALL accept ConversationSummary items with id, title, updatedAt and optional preview, unread, icon and disabled. With groupBy='recency' (default), it SHALL group by local calendar dates against now (default the current time), in Today, Yesterday, Previous 7 days, Older order, omitting empty groups. With groupBy=false it SHALL preserve input order without headings. A function SHALL group by its returned key in first-seen order. Dates SHALL use I18nProvider formatters, with short time today and short date otherwise.

#### Scenario: Four ages

- **GIVEN** now is 2026-03-10 12:00 local time
- **WHEN** updatedAt values are 2026-03-10 09:00, 2026-03-09 18:00, 2026-03-06 10:00 and 2026-02-01 10:00
- **THEN** Today, Yesterday, Previous 7 days and Older render in that order, each with one row
- **AND** supplying only today's item renders only Today

#### Scenario: Consumer grouping

- **WHEN** groupBy is false
- **THEN** no headings render and input order is preserved
- **WHEN** groupBy is a function
- **THEN** items with the same returned key share a heading

### Requirement: Groups disclose their rows

Headings SHALL be buttons with aria-expanded. Collapsing SHALL hide the group's rows. collapsedGroups SHALL be controlled with onCollapsedGroupsChange notifications; defaultCollapsedGroups SHALL initialize uncontrolled state. Recency keys SHALL be today, yesterday, previous7Days and older; custom keys SHALL be the function's returned strings.

#### Scenario: Controlled disclosure

- **GIVEN** collapsedGroups contains yesterday
- **WHEN** Yesterday is activated
- **THEN** onCollapsedGroupsChange receives the keys without yesterday
- **AND** its rows remain hidden until the controlled prop changes

### Requirement: History has roving focus

The nav SHALL default to the localized accessible name Conversations. On entry it MUST expose one Tab stop: the enabled active row, else the first enabled row. ArrowDown and ArrowUp SHALL move across headings and enabled visible rows, skipping collapsed and disabled rows. Home and End SHALL focus the first and last entries. Tab SHALL leave the nav. This SHALL be a roving list of buttons or opt-in links, not a listbox.

#### Scenario: Active entry and collapsed group

- **GIVEN** the Today row is active and Yesterday is collapsed
- **WHEN** Tab enters the nav
- **THEN** the Today row is focused
- **WHEN** ArrowDown is pressed twice
- **THEN** focus moves through Yesterday to Previous 7 days, skipping Yesterday's rows
- **AND** Tab leaves the nav

### Requirement: Selection is reported once

activeId SHALL be controlled; defaultActiveId SHALL initialize uncontrolled selection. The active row SHALL carry aria-current=true and an accent background. Click, Enter and Space SHALL call onActiveChange(id) exactly once on an enabled row. getHref SHALL opt into anchors with the returned href and retain activation reporting. Disabled rows SHALL never activate.

#### Scenario: Switching conversations

- **GIVEN** row a is active
- **WHEN** Enter is pressed on enabled row b
- **THEN** onActiveChange is called once with b
- **AND** controlled selection remains unchanged until activeId updates

### Requirement: Actions are sibling controls

Each row SHALL have a MoreMenu trigger named More actions for {title}, as a DOM sibling of the row control. It SHALL be revealed on hover or focus and visible on touch. ArrowRight (ArrowLeft in RTL) SHALL focus the trigger from the row. ArrowLeft (ArrowRight in RTL) or Escape on the trigger SHALL return to the row. Rename SHALL appear only with onRename, Delete only with onDelete, then itemActions items in order. Delete SHALL be destructive.

#### Scenario: Available actions

- **GIVEN** onRename and itemActions are set but onDelete is absent
- **WHEN** the menu opens
- **THEN** Rename precedes itemActions and Delete is absent
- **AND** the trigger is never nested in the row button or link

### Requirement: Rename is inline and cancellable

Rename or F2 SHALL show the kit Input with the current title selected. Enter SHALL trim the draft and call onRename(id, title) only for a nonempty changed title, then refocus the row. Escape SHALL cancel and refocus the row. Disabled rows SHALL not rename.

#### Scenario: Rename and cancel

- **GIVEN** a row titled Budget review and onRename
- **WHEN** F2 starts editing and the user enters a padded Q3 budget and presses Enter
- **THEN** onRename receives the id and Q3 budget, and focus returns to the row
- **WHEN** another edit is escaped, empty or unchanged
- **THEN** onRename is not called

### Requirement: Unread messages are localized

Positive unread SHALL render a primary sm Badge with a localized plural accessible label. Zero or absent unread SHALL render no badge. All component strings SHALL have en/es catalog entries and matching English chat fallbacks for older UI catalogs.

#### Scenario: Three unread messages

- **WHEN** unread is 3
- **THEN** English exposes 3 unread messages and Spanish exposes 3 mensajes sin leer

### Requirement: Creation and incremental loading are separate actions

onNew SHALL render New chat above the nav with optional newShortcut in a Kbd (hint only). hasMore SHALL render Load more after the nav and call onLoadMore once per activation. loadingMore SHALL make it aria-busy and disabled while preserving focus. emptyState SHALL render for an empty history.

#### Scenario: Loading more

- **GIVEN** Load more is focused
- **WHEN** the application sets loadingMore
- **THEN** focus remains there, aria-busy and disabled semantics are exposed, and repeated activation does not call onLoadMore

### Requirement: Long histories are measured and windowed

Above virtualizeAt (default 100), the list SHALL use useVirtualWindow with ResizeObserver-measured heights cached by stable keys and estimated fallbacks. It MUST retain the tab-stop row outside the window and preserve roles and keys between modes.

#### Scenario: One thousand rows

- **GIVEN** 1,000 items, virtualizeAt=100 and a 600px viewport
- **WHEN** rendered
- **THEN** fewer than 60 rows are mounted
- **WHEN** scrolled away from the tab-stop row
- **THEN** that row stays mounted and ArrowDown continues from it

### Requirement: Examples meet kit accessibility and brand contracts

Live examples and the updated messaging template SHALL be axe-clean in dark, light and high_contrast without nested interactive controls. Styles SHALL use token classes, no palette or literal colors, dark variants, gradients or glow, and reduced-motion behavior for any transitions.

#### Scenario: Catalog examples

- **WHEN** examples are rendered in each theme
- **THEN** axe reports no violations (browser CI verifies rendered contrast)
