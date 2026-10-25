# Change: Add useClipboard

## Why

Kit copy actions bypass the existing clipboard fallback, and custom actions need shared copied, failed and error feedback.

## What Changes

- Export useClipboard with lazy getters, success flags, temporary feedback, reset, latest-call handling and optional LiveAnnouncer support.
- Rebuild CopyButton on the hook while preserving its props and rendered DOM.
- Route the scoped ui, blocks, chat and code-editor copy actions through the shared clipboard path.
- Document a row menu with Copy ID and Copy as cURL, regenerate the registry and release the four packages together.

## Impact

- Capability: ui/hooks/use-clipboard (added).
- Packages: @gntik-ai/ui (minor), @gntik-ai/blocks, @gntik-ai/chat and @gntik-ai/templates (patch).
- Clipboard reading, rich content, new failure UI, a hooks entry point and new catalog keys are outside scope.
