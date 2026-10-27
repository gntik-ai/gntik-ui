## Purpose

Diagram view for Mermaid sources in chat replies: lazily loaded rendering themed from the tokens, code view, copy, SVG download, zoom and pan, with a code fallback.

## ADDED Requirements

### Requirement: Mermaid sources render as diagrams loaded on demand

MermaidDiagram SHALL load the Mermaid library only when the first diagram mounts and SHALL show the source code until it has loaded or while `streaming` is true.

#### Scenario: First diagram

- **WHEN** a reply with a mermaid fence finishes streaming
- **THEN** the library is requested once
- **AND** the diagram replaces the code view after loading

### Requirement: Invalid diagrams fall back to code

When the source fails to parse or render, the component MUST show the source as a code block with a short failure note and SHALL NOT throw.

#### Scenario: Typo in the source

- **WHEN** the code is `graph TD; A-->`
- **THEN** the code block shows the source
- **AND** the note `Could not render the diagram` is shown

### Requirement: Diagram source cannot run script

The renderer MUST run with strict security, so the resulting SVG SHALL contain no script elements, event-handler attributes or JavaScript URLs, whatever the source.

#### Scenario: Hostile label

- **WHEN** the source contains `click A call alert()` and an `<img src=x onerror=alert(1)>` label
- **THEN** the SVG has no `onerror` or `onclick` attribute
- **AND** no script element is rendered

### Requirement: Diagram colours follow the active theme

Theme variables SHALL be read from the tokens runtime, and the diagram MUST re-render when the theme changes.

#### Scenario: Theme switch

- **GIVEN** a diagram rendered in the dark theme
- **WHEN** the user switches to light
- **THEN** the diagram re-renders with the light theme's token colours
