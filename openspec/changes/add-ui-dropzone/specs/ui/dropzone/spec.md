## Purpose

Dropzone: a file drop target with idle, accept and reject drag states, type, size and count validation, a file picker, a headless hook and an optional full-screen target.

## ADDED Requirements

### Requirement: Drag state shows whether the dragged files are acceptable

While files are dragged over it, Dropzone SHALL set data-drag-state to accept or reject from MIME types and count, render only the matching state part, and return to idle on leaving without flickering over child elements. Only drags carrying the Files type SHALL be handled. Empty MIME items SHALL count as provisionally acceptable; extension and size rules SHALL apply on drop.

#### Scenario: Accepted and rejected MIME types

- **GIVEN** accept is .csv,text/csv
- **WHEN** a text/csv file enters the zone
- **THEN** data-drag-state is accept and only DropzoneAccept renders
- **AND** an image/png drag sets reject and renders only DropzoneReject

#### Scenario: Too many files

- **GIVEN** maxFiles is 1
- **WHEN** two files are dragged over the zone
- **THEN** data-drag-state is reject

### Requirement: Dropped and picked files are validated and announced

Dropzone SHALL validate type, size and count, call onDrop with accepted files and rejections carrying all applicable reasons, call onReject when rejections exist, and announce counts politely. Accept SHALL support a string or readonly string array of case-insensitive extensions, MIME types and wildcards.

#### Scenario: Mixed drop

- **GIVEN** accept is .csv and maxSize is 25 MB
- **WHEN** a.csv (2 MB), b.png and c.csv (30 MB) are dropped
- **THEN** onDrop receives a.csv as accepted and b.png for type and c.csv for size as rejected
- **AND** onReject receives those rejections
- **AND** the polite announcement is "1 file added. 2 rejected."

### Requirement: Clickable zone opens the picker from the keyboard

With activateOnClick (default true), Dropzone SHALL be a named role button with one tab stop, open the picker on click, Enter and Space and reset the input after each selection. With activateOnClick false the root SHALL have no button role or tabindex and DropzoneTrigger SHALL open the picker. Clickable zones SHALL contain no interactive children.

#### Scenario: Keyboard and repeated selection

- **WHEN** Space or Enter is pressed on the focused zone
- **THEN** the picker opens
- **AND** picking the same file twice calls onDrop twice

### Requirement: Headless hook turns any element into a drop target

useDropzone SHALL expose rootProps, inputProps, dragState and open with the same validation and drag behavior and no chrome.

#### Scenario: Plain div

- **GIVEN** a div spreads rootProps from useDropzone with accept image/*
- **WHEN** a PNG is dropped on it
- **THEN** onDrop receives the PNG as accepted

### Requirement: Full-screen target covers the viewport while files are dragged

With fullScreen, Dropzone SHALL portal an overlay covering the viewport during file drags, handle a drop anywhere, hide on window leave or Escape and remove window listeners on unmount. Only one full-screen zone SHALL be mounted per page.

#### Scenario: Drop anywhere

- **WHEN** files enter the window and are dropped on the page header
- **THEN** the overlay was visible and onDrop receives the files
- **AND** non-file drags never show it

### Requirement: Disabled zones ignore interaction

Disabled zones SHALL expose aria-disabled true, stay idle and ignore drops, clicks and keys.

#### Scenario: Disabled file drag

- **GIVEN** the zone is disabled
- **WHEN** a CSV is dragged or dropped on it
- **THEN** the zone remains idle and onDrop is not called

### Requirement: Existing consumers and accessibility remain compatible

FileUploadPanel SHALL retain its props, group, label, Browse and hint markup and acceptsFile delegate, and show destructive feedback for rejected MIME drags. ChatComposer SHALL retain its props, form data-dragging, overlay, paste behavior and the public single-reason validateFiles API including current-count handling and rejection order. Strings SHALL come from English and Spanish i18n catalogs and styles SHALL use tokens only. Every example SHALL be axe clean in dark, light and high_contrast.

#### Scenario: Existing upload tests

- **WHEN** the unchanged FileUploadPanel, ChatComposer and ChatComposer.readonly tests run
- **THEN** all pass with their existing imports and drag assertions
