# Add Dropzone and shared file validation

## Why

FileUploadPanel and ChatComposer duplicate file drag handling and accept matching. A shared target provides consistent drag feedback and a reusable picker without changing their public APIs.

## What Changes

- Add Dropzone, its state parts, trigger, caption and useDropzone to @gntik-ai/ui.
- Add input-style accept matching and type, size and count validation with multiple rejection reasons.
- Adopt the shared drag hook in FileUploadPanel and ChatComposer, preserving the block's group, label, Browse button and hint, and chat's form data-dragging, overlay and rejection API.
- Add English/Spanish messages, live examples, keyboard/axe tests, registry output and a changeset.

## Impact

- Capability: ui/dropzone (ADDED). Risk R1, additive API and internal refactors.
- No file transport, folder drops, paste changes, compact file field, deployment or publishing.
- Roll back by reverting this ChangeSet or pinning the previous kit release.
