## Purpose

DataTable provides accessible row activation and a handle to reveal listed rows.

## ADDED Requirements

### Requirement: Row href links the row header and the rest of the row follows it

With getRowHref returning a URL, DataTable SHALL render a kit Link in the visible row-header cell, or the first visible column when no row-header is visible. Plain row clicks SHALL activate that element through LinkProvider exactly once. Undefined destinations MUST remain inert. Without new props, existing row DOM and behavior SHALL remain unchanged.

#### Scenario: Click on a plain cell

- **GIVEN** getRowHref returns /deployments/orders
- **WHEN** the region cell of orders-api is clicked
- **THEN** the router follows that href once through the row-header link

#### Scenario: Row without a destination

- **WHEN** getRowHref returns undefined
- **THEN** the row has no identifying link and no activation click handler

### Requirement: Interactive content and text selection remain independent

Row activation, selection and detail clicks MUST ignore default-prevented events, links, buttons, form controls, labels, checkbox/menuitem/button roles, contenteditable, data-row-click-ignore, data-cell-editor, data-cell-edit-trigger and data-detail-interactive descendants. Clicks ending a non-collapsed selection inside the row MUST preserve it and MUST NOT activate the row.

#### Scenario: Controls and selected text

- **WHEN** the user clicks a checkbox, radio, actions trigger, editable trigger, open editor or opted-out content, or releases a text selection
- **THEN** no row navigation or onRowClick occurs
- **AND** selected text remains selected

### Requirement: Modifier and middle clicks open the destination in a new tab

Ctrl-click, Cmd-click and middle row clicks SHALL call window.open with the href, _blank and noopener, without current-page navigation. Plain row clicks MUST NOT call window.open.

#### Scenario: Modified cell click

- **WHEN** a user Ctrl-clicks a status cell in a linked row
- **THEN** its href opens once in a new tab and the current page remains unchanged

### Requirement: Row callbacks have an accessible identifying control

onRowClick SHALL run once per plain-content click or identifying-control activation, with the typed row and mouse event. preventDefault SHALL cancel href navigation. Without getRowHref the identifying control SHALL be a link-styled button supporting Tab, Enter and Space. Rows MUST NOT gain a tr tabIndex. onRowDoubleClick SHALL fire once per pointer double click outside interactive content, never from keyboard activation; its action MUST also be reachable through the row link, callback or rowActions.

#### Scenario: Keyboard button and cancellation

- **WHEN** the identifying button is activated with Enter or Space
- **THEN** onRowClick receives the row once
- **AND** when a linked-row callback prevents default, navigation is cancelled

### Requirement: Row selection has explicit precedence

selectOnRowClick SHALL toggle the multiple checkbox or select the single radio, skipping isRowDisabled rows. getRowHref or onRowClick SHALL override selectOnRowClick and detailOnRowClick, with one development warning per table naming ignored props.

#### Scenario: Select two rows

- **WHEN** two enabled status cells are clicked with multiple selection and selectOnRowClick
- **THEN** both checkboxes are selected and onSelectionChange runs twice

#### Scenario: Competing props

- **GIVEN** getRowHref and selectOnRowClick
- **WHEN** a plain cell is clicked
- **THEN** the href is followed without selection or detail toggling and one development warning names the ignored prop

### Requirement: The scroll handle reveals listed rows without smooth motion

DataTableHandle.scrollToRow(id, options) SHALL return true for a listed row, request its client page through onPageChange, expand its group through onCollapsedGroupsChange and scroll with auto, start, center or end alignment without smooth animation. Controlled props SHALL remain authoritative. focus SHALL focus its first control after rendering. Virtual rows SHALL use row offsets, including group headers. Server tables MUST search only supplied rows. Unknown ids MUST return false without changing page, groups or scroll position.

#### Scenario: Row on page 3 in a collapsed group

- **GIVEN** a client table on page 1 with the target on page 3 in a collapsed group
- **WHEN** scrollToRow targets that row
- **THEN** page 3 is requested and its group expands before the row scrolls into view

#### Scenario: Virtual row 800

- **GIVEN** 1000 virtual rows
- **WHEN** scrollToRow targets row 800 with center alignment and focus
- **THEN** scrollTop centers row 800 without smooth motion and its first control is focused

#### Scenario: Unknown id

- **WHEN** scrollToRow targets missing
- **THEN** it returns false and page, groups and scroll position do not change
