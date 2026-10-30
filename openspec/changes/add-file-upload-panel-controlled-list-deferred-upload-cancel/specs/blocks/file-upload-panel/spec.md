## Purpose

File upload panel block: a drop zone with a Browse button, type and size validation, and a file list with progress, retry, remove and cancel, uncontrolled or controlled by the app.

## ADDED Requirements

### Requirement: Controlled file list reports every change with a reason

When files is set, FileUploadPanel SHALL render exactly that list and SHALL request each change through onFilesChange(files, {reason, ids}) with reason add, progress, done, error, remove or cancel. Progress MUST be reported only when the floored whole percentage changes. Uncontrolled mode SHALL also report changes.

#### Scenario: Picked file in controlled mode

- **GIVEN** files=[] and an onFilesChange spy
- **WHEN** the user picks report.csv
- **THEN** onFilesChange is called once with reason add
- **AND** the item has status uploading and carries the picked File
- **AND** no row renders until the app passes the item back

#### Scenario: Fractional progress

- **WHEN** the upload reports 40, 41.4 and 41.8
- **THEN** reason progress is reported twice, for 40 and 41
- **AND** completion reports reason done with progress 100

#### Scenario: Existing uncontrolled progress display

- **GIVEN** files and onFilesChange are omitted
- **WHEN** the existing two-argument onUpload callback reports 41.4 then 41.8
- **THEN** the panel retains its original fractional progress and displays 41% then 42%
- **AND** the callback receives the picked File and progress reporter

#### Scenario: Concurrent controlled callbacks

- **GIVEN** the parent stores each requested list in state and supplies it through files
- **WHEN** two uploads report progress and finish before React renders the next supplied list
- **THEN** each request preserves the preceding changes and both files finish uploaded
- **AND** an async beforeUpload followed by an immediately resolved upload retains the added file

### Requirement: Manual upload mode keeps picked files without uploading

With uploadMode="manual", accepted files SHALL be listed with status pending and the text "{size} · ready to upload", and onUpload MUST NOT be called; each item SHALL carry its File for the app to submit. A 4,300-byte pending file SHALL read "4.2 KB · ready to upload", with locale-aware number formatting.

#### Scenario: Two files picked for a form

- **WHEN** the user picks a.csv and b.csv in manual mode
- **THEN** two rows show ready to upload
- **AND** onUpload has not been called
- **AND** both items in onFilesChange carry their File

### Requirement: beforeUpload can drop, replace or reject a file

beforeUpload SHALL run for each file that passed the built-in checks. Resolving false SHALL drop the file without a row, resolving a File SHALL replace it, and a rejection SHALL add an error row with the rejection message and no Retry. Rows of one batch MUST be added in pick order after all results settle, with aria-busy on the panel meanwhile.

#### Scenario: Transform

- **WHEN** beforeUpload resolves a File named photo.webp for photo.png
- **THEN** the row shows photo.webp
- **AND** onUpload receives the new File

#### Scenario: Reject

- **WHEN** beforeUpload rejects with Error('Checksum mismatch')
- **THEN** the row reads Checksum mismatch · not uploaded
- **AND** the row has no Retry button

#### Scenario: Ignore

- **WHEN** beforeUpload returns false for notes.txt in a batch of three
- **THEN** no row is added for notes.txt
- **AND** the announcement says 2 files added.

### Requirement: Removing an uploading file cancels its upload

FileUploadPanel SHALL pass an AbortSignal to onUpload and SHALL abort it when the item is removed while uploading or when the panel unmounts. A cancelled item MUST be removed without an error row, its later settle MUST change nothing, and the panel SHALL announce "Upload of {name} cancelled." Retry SHALL use a fresh signal with the same item id. The demo uploader SHALL clear its timer on abort.

#### Scenario: Cancel button

- **GIVEN** report.csv is uploading
- **WHEN** the user activates Cancel upload of report.csv
- **THEN** the signal passed to onUpload is aborted
- **AND** the row is removed
- **AND** the status region reads Upload of report.csv cancelled.

#### Scenario: Settle after cancel

- **WHEN** onUpload rejects with an AbortError or resolves after cancel
- **THEN** no error row appears
- **AND** no completion or failure is announced

#### Scenario: Parent omits the source File

- **GIVEN** an upload started by the panel is still in flight
- **AND** the parent supplies the controlled item without its optional file property
- **WHEN** the user activates Cancel upload of report.csv
- **THEN** the signal is aborted and reason cancel is requested
- **AND** the panel announces Upload of report.csv cancelled.

#### Scenario: Unmount

- **WHEN** the panel unmounts with an upload in flight
- **THEN** that upload's signal is aborted

### Requirement: onRemove can veto a removal

FileUploadPanel SHALL call onRemove before removing a row. A return or resolved value of false, or a rejection, MUST keep the row; while a returned promise is pending the row's remove button SHALL be disabled. A rejection SHALL be announced as "{name} could not be removed." Returning undefined SHALL remove synchronously.

#### Scenario: Synchronous veto

- **WHEN** onRemove returns false for report.csv
- **THEN** the row stays
- **AND** focus stays on its remove button

#### Scenario: Async rejection

- **WHEN** onRemove returns a promise that rejects
- **THEN** the remove button is disabled until it settles
- **AND** the row stays and report.csv could not be removed. is announced

### Requirement: Localized accessible examples

New core messages SHALL have English and Spanish entries with optional label overrides. Live docs SHALL demonstrate manual controlled submission, preprocessing, cancellation and removal veto. Pending rows SHALL reuse muted tokens, and all changed states SHALL be axe-clean in dark, light and high_contrast.

#### Scenario: Provider and label overrides

- **WHEN** the panel uses an English or Spanish provider or custom ready/cancel/cancelled/removeFailed labels
- **THEN** the matching localized or overridden strings are rendered and announced
