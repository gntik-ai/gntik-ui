# Add compact file selection

## Why

The kit lacks a compact file field for forms. ProfileHeader and ChatComposer each maintain an inline hidden picker and its reset behavior.

## What Changes

- Add FileInput, FileTrigger and component-bound useFileDialog to @gntik-ai/ui.
- Reuse validateFiles for accept and size rejection; localize file display and accessible strings in English and Spanish.
- Separate the attached, unnamed picker from a named input synchronized through DataTransfer for native form submission. Reset uncontrolled fields to defaultValue and re-sync controlled fields on form reset.
- Replace the two consumer pickers with conditional FileTrigger elements. Their picker moves outside their container, and hidden actions leave no input.
- Add docs examples, keyboard/axe/unit tests and native browser form/modal checks, registry output and one changeset.

## Impact

- Capability: ui/file-input (all requirements ADDED). Issue #152; R1.
- UI minor; blocks and chat patch. No dependency, transport, drop target, FileUploadPanel picker or release workflow changes.
- Without DataTransfer or writable input.files, controlled use still works but native form submission cannot carry the value; submit from the callback/value instead.
- Real modal picker and FormData checks run in PR CI. A modal picker failure requires review rather than a workaround.
- Rollback: revert this change or pin the previous kit packages.
