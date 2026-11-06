## Purpose

FileInput, FileTrigger and useFileDialog provide compact file selection and native file picker helpers.

## ADDED Requirements

### Requirement: FileInput displays and names its value

FileInput SHALL display the localized placeholder when empty, an icon, filename and localized size for one file, and a localized count for several files. renderValue MUST replace either nonempty default display. A Field label and value text MUST both name the control.

#### Scenario: JSON key

- **GIVEN** a Field labelled Service account key
- **WHEN** sa-prod.json of 2,345 bytes is picked
- **THEN** the control displays the file icon, sa-prod.json and 2.3 kB (2,3 kB in Spanish)
- **AND** its accessible name contains the label and filename

#### Scenario: Several files

- **WHEN** three files are picked with multiple
- **THEN** the display is 3 files (3 archivos in Spanish), unless renderValue is supplied

### Requirement: Reopening and cancellation preserve the value

Picker helpers SHALL reset only their unnamed picker before opening. Selecting the same file again MUST notify again. Cancel events or empty changes MUST preserve the value without notifying.

#### Scenario: Repeated pick and cancellation

- **WHEN** a file is selected twice and then the picker is cancelled
- **THEN** onValueChange fires twice and the file remains selected

### Requirement: Clear is a sibling action

When clearable is true and a value exists, FileInput SHALL expose a sibling clear button. It MUST emit null in single mode or an empty array in multiple mode, then focus the control.

#### Scenario: Clear

- **WHEN** Clear file is activated
- **THEN** the placeholder appears, no file submits and focus returns to the control

### Requirement: Named input follows the value and form reset

With name and platform support for DataTransfer and writable input.files, FileInput SHALL submit the selected files through a separate named input. Reopening or cancelling MUST NOT change it. Form reset MUST restore defaultValue for uncontrolled fields and synchronize the current controlled value.

#### Scenario: Native FormData

- **WHEN** a selected file is submitted under credentials
- **THEN** FormData contains the selected File
- **AND** after clearing there is no nonempty file entry

### Requirement: Shared validation rejects invalid files

FileInput SHALL reuse validateFiles and report FileRejection reasons through onReject. Mixed picks MUST set only accepted files; an entirely rejected pick MUST preserve the value.

#### Scenario: Type and size rejection

- **GIVEN** accept .json,application/json and maxSize 1 MB
- **WHEN** key.pem and a 3 MB JSON file are picked
- **THEN** they are rejected with reasons type and size respectively

### Requirement: Field state and keyboard accessibility

FileInput SHALL inherit Field disabled and invalid states and descriptions. Disabled controls and clear actions MUST open nothing. Outside a Field, the accessible name MUST fall back to localized choose or chooseMany. Buttons MUST be type button, use token classes and provide focus, invalid and disabled styles including forced-colors fallbacks.

#### Scenario: Invalid field

- **GIVEN** an invalid Field with a displayed FieldError
- **THEN** the control has aria-invalid true and is described by the error

### Requirement: FileTrigger and useFileDialog expose attached picker behavior

FileTrigger SHALL support click, Enter and Space, custom render elements, onSelect, accept, multiple, directory and capture without submitting a surrounding form. useFileDialog SHALL return open, reset and files, create one hidden tabIndex -1 picker only in an effect in the portal container or document body, render nothing and remove the picker on unmount.

#### Scenario: Modal and SSR

- **WHEN** FileTrigger is activated inside a modal Dialog
- **THEN** its attached picker opens
- **AND** server rendering useFileDialog touches no document

### Requirement: Consumer actions own their picker lifecycle

ProfileHeader and ChatComposer SHALL contain no input of type file. Hidden avatar or attachment actions MUST leave no picker in the document. Existing validation, accept, multiple, accessible names and keyboard behavior MUST be preserved.

#### Scenario: Hidden action

- **WHEN** onAvatarChange is null, onAttach is absent or ChatComposer is readOnly
- **THEN** that action has no attached file input

### Requirement: Documentation and release metadata

Every added behavior SHALL have a live docs example and English and Spanish catalog strings. New examples MUST be axe clean in dark, light and high_contrast. Registry output and one changeset naming ui minor, blocks patch and chat patch MUST accompany the change.

#### Scenario: Consumer discovery

- **WHEN** the registry is regenerated
- **THEN** FileInput and its examples and helper exports are discoverable
