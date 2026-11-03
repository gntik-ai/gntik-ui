## Purpose

Backdrops of the modal overlays in @gntik-ai/ui (Dialog and AlertDialog, Drawer, BottomSheet, CommandPalette, Lightbox): how they cover the page behind an open overlay.

## ADDED Requirements

### Requirement: Backdrops cover the visual viewport on iOS Safari

Under `@supports (-webkit-touch-callout: none)`, base.css SHALL set `position: relative` and `--backdrop-position: absolute` on `<body>`; the Dialog, Drawer, BottomSheet, CommandPalette and Lightbox backdrops SHALL use `position: var(--backdrop-position, fixed)` with a minimum height of `100dvh`, so without base.css they MUST stay fixed.

#### Scenario: Desktop browser

- **GIVEN** a Dialog is open in desktop Chromium
- **WHEN** the page imports base.css or not
- **THEN** the backdrop computes `position: fixed`

#### Scenario: iOS Safari with base.css

- **GIVEN** base.css is imported on iOS 26 Safari
- **WHEN** a Dialog is open
- **THEN** the backdrop computes `position: absolute`
- **AND** the area under the browser toolbars is covered
