## Purpose

Full-height chat frame with thread, pinned composer, optional header, inline-start history and the existing optional resizable inline-end panel.

## ADDED Requirements

### Requirement: History sidebar renders at the inline start

ChatLayout SHALL accept optional sidebar and sidebarWidth (default 280px). A supplied sidebar SHALL render before the named thread, at the inline start, from md up. Without sidebar the DOM MUST remain identical to the thread-only layout. The thread's accessible name and existing panel behavior SHALL remain unchanged. Applications SHALL own responsive Drawer behavior, demonstrated in a live example.

#### Scenario: Left-to-right and right-to-left

- **GIVEN** the page is LTR or RTL
- **WHEN** sidebar is supplied
- **THEN** it renders before the thread at inline start (left in LTR, right in RTL)
- **AND** its default width is 280px, overridable by sidebarWidth
- **AND** the thread retains its aria-label and the panel remains resizable

#### Scenario: Thread only

- **WHEN** sidebar is omitted
- **THEN** no sidebar wrapper is rendered and the pre-change DOM snapshot is preserved
