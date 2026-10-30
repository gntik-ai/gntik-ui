# Controlled file lists, deferred submission and upload cancellation

## Why

Forms need access to picked File objects for submission with other fields. Uploads need cancellation, preprocessing and a removal veto without replacing the existing uncontrolled auto-upload API.

## What changes

- Add files/onFilesChange with add, progress, done, error, remove and cancel reasons; controlled rendering uses only the files prop.
- Add uploadMode="manual" and UploadStatus pending, retaining each accepted item.file.
- Add beforeUpload after built-in validation: false drops, File replaces, rejection yields a non-retryable error. Async batches preserve pick order and expose aria-busy.
- Pass {signal, id} to onUpload; abort on cancel and unmount, ignore late callbacks and use a fresh signal on retry.
- Invoke onRemove before removal; false or rejection keeps the row and promises disable its button while pending.
- Add English/Spanish messages, label overrides, live manual/auto examples, tests and a minor blocks changeset.

## Impact

Affected capability: blocks/file-upload-panel. All requirements are ADDED because no baseline spec exists. No new dependencies or transport implementation. Count/size extensions, previews, paste/folders, imperative uploadAll and native-input mirroring remain out of scope.

UploadStatus gains pending, which affects exhaustive consumer switches. onRemove now observes the item before removal. A real transport must forward the AbortSignal to fetch/XHR. Pending rows format 4,300 bytes as "4.2 KB · ready to upload" ("4,2 KB · listo para subir" in Spanish); existing uploaded rows retain their decimal formatting.
