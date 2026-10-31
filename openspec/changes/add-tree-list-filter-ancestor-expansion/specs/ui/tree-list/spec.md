## Purpose

TreeList: a hierarchical list on the WAI-ARIA tree pattern with roving focus, expansion, typeahead, lazy children and single or multiple selection.

## ADDED Requirements

### Requirement: Filter shows matches and their ancestors

With a non-empty filter, TreeList SHALL show nodes reported by filterNode (default case- and accent-insensitive label matching), their ancestors, and the whole reachable subtree of each matching branch. It MUST search only loaded nodes, preserve original node objects in callbacks, and MUST NOT change selection. Documentation SHALL explain matching branches, unloaded children and debouncing large trees.

#### Scenario: Find a component file

- **GIVEN** the TreeListFiles tree with only src expanded and index.ts selected
- **WHEN** filter is dialog
- **THEN** only src, components and Dialog.tsx are visible
- **AND** the selection is unchanged

#### Scenario: Matching branch

- **WHEN** filter matches src
- **THEN** expanding src and components reveals Button.tsx, Dialog.tsx and index.ts
- **AND** onAction and loadChildren receive the caller's identity-equal nodes

### Requirement: Filtering expands ancestors and restores previous expansion

While filter is non-empty, TreeList SHALL expand every ancestor of a match using a separate expansion set without calling onExpandedChange, allow user collapse and expansion, and restore the previous expansion when cleared.

#### Scenario: Collapse and clear

- **GIVEN** only src was expanded before filtering for dialog
- **WHEN** components is collapsed
- **THEN** Dialog.tsx is hidden until components is re-expanded
- **WHEN** the filter is cleared
- **THEN** only src is expanded and onExpandedChange has not been called

### Requirement: Matches are highlighted and counted

TreeList SHALL use matchRanges to highlight only matcher-reported plain labels with the existing JsonViewer mark style. Rich content and containment-only ancestors MUST NOT be marked. An active filter SHALL render a localized polite status; an empty filter MUST NOT render a status or aria-live element. No matches SHALL hide the tree with the hidden attribute and show common.noMatches.

#### Scenario: Accent-insensitive highlight

- **WHEN** filter is configuracion and a node is labelled Configuración
- **THEN** the node is visible and the mark covers Configuración

#### Scenario: Localized counts

- **WHEN** one or three nodes match
- **THEN** English status reads 1 match or 3 matches and Spanish reads 1 coincidencia or 3 coincidencias

#### Scenario: No match

- **WHEN** filter is zzz
- **THEN** the tree has hidden and No matches. is shown

### Requirement: Keyboard interaction uses visible nodes

Focus fallback, arrow navigation and typeahead SHALL use visible nodes. Ctrl/Cmd+A in multiple mode while filtering SHALL select only visible enabled nodes and retain hidden selections.

#### Scenario: Focused node disappears

- **WHEN** a filter removes the focused node
- **THEN** the first visible node becomes the tab stop
- **AND** arrows and typeahead never move to filtered-out nodes

### Requirement: Link nodes navigate as tree items

A node with href SHALL render through LinkProvider as an anchor treeitem inside li role none, owning its group with aria-owns. Click and Enter SHALL navigate, modifier and middle clicks SHALL preserve native navigation, and Space SHALL select. currentHref SHALL set aria-current page. Disabled nodes MUST prevent plain, modifier and middle click navigation before router handling.

#### Scenario: Docs navigation

- **GIVEN** a node Getting started with href /docs/getting-started and that currentHref
- **THEN** the anchor has role treeitem and aria-current page
- **AND** Space selects without navigation and Enter navigates

#### Scenario: Disabled link

- **GIVEN** an aria-disabled link treeitem
- **WHEN** plain, Ctrl/Cmd or middle click is dispatched
- **THEN** neither native nor router navigation occurs

### Requirement: Groups animate using motion tokens

Child groups SHALL use Base UI Collapsible panel states for height transitions on --duration-normal and --ease-standard. Closing groups SHALL remain mounted until the transition completes and MUST NOT allow focus. Reduced motion SHALL toggle groups immediately.

#### Scenario: Closing group

- **WHEN** an expanded folder closes
- **THEN** its ending-style group remains inert with no tabbable items until transition completion

#### Scenario: Reduced motion

- **GIVEN** reduced motion
- **WHEN** a folder closes
- **THEN** its group toggles immediately

### Requirement: Unfiltered consumers preserve performance and markup

TreeList SHALL compute a filtered model only for active filters, memoized by data, loaded children, query, matcher and expansion. With empty filter and no href nodes, flatten calls SHALL NOT increase across re-renders, resting markup SHALL remain unchanged apart from branch data-open/data-closed, and the JsonViewer DOM snapshot SHALL remain identical.

#### Scenario: Unrelated render

- **GIVEN** stable unfiltered nodes and expansion
- **WHEN** focus, selection or unrelated parent state changes
- **THEN** flattenVisible is not called again
- **AND** the existing TreeList and JsonViewer tests pass
