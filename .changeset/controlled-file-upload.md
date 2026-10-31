---
'@gntik-ai/blocks': minor
'@gntik-ai/ui': patch
---

Add controlled and deferred file uploads, preprocessing, abortable uploads and removal vetoes with localized labels, preserving batched controlled updates without retaining declined changes and using the current row for asynchronous removals; UploadStatus adds 'pending' (update exhaustive switches), and onRemove now runs before removal and can veto it.
