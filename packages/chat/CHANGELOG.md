# @gntik-ai/chat

## 0.12.0

### Minor Changes

- 34ab430: Add composer header, prefix and footer slots, Mod+Enter submission, selectable read-only drafts and text actions with translated hints and header controls.
- 0efd57c: Add experimental useConversations for conversation lists, active selection and per-conversation message storage.
- e8c3141: Add opt-in, lazily loaded Mermaid diagrams with token themes for flowcharts and sequence diagrams, sanitised SVG, accessible controls and English/Spanish labels.
- f53c719: Add `readSSE` and `readTextParts`, dependency-free readers that turn a streamed fetch response into Server-Sent Events or separator-delimited text parts, with abort, early-exit cancellation and a buffer limit.
- 8ac6dd2: Add a collapsible reasoning trace with streaming labels, elapsed time, safe Markdown and localized thinking announcements.
- 9893fc4: Add experimental streaming chat hooks and backend adapters, with optional adapter support in the assistant template.
- 5ec552c: Add accessible conversation history with recency groups, row actions that preserve a single Tab stop, windowing, an optional chat sidebar, and localized messaging history.
- 8e812fe: Add safe Markdown component overrides, code renderers, custom block tags, plugins and opt-in sanitised HTML with translated live examples, preserving streaming code focus, document-wide references and GFM footnote navigation.
- 1eb473d: Add optional ToolCallCard approval actions, denial reasons and decision records with English and Spanish catalogs; ToolCallStatus is widened with awaiting-approval and denied, so exhaustive consumer maps and switches may need updating.

### Patch Changes

- 83304af: Add Dropzone and useDropzone with shared file validation, picker access, accept/reject feedback and safe disabled drops, while preserving upload and chat drop behavior.
- 41a4991: Report failed clipboard writes in chat, DescriptionListCard and LogViewer; onCopy and onCopyLine now fire only after successful writes, so click-based analytics may record fewer events.
- 01125b0: Add an in-app reduced-motion preference, scoped motion utilities and an appearance settings switch.
- e12e80a: Add named z-index layers and move kit overlays and sticky surfaces onto them; toasts and popups stay above modals, and app z-50 now sits under kit overlays.
- 3ffe148: Add useClipboard for custom copy actions and share fallback writes and accurate feedback across kit copy controls.
- cd9b1bd: Add SSR-safe media query and breakpoint hooks with shared breakpoint tokens, and use them for responsive panels and reduced-motion behaviour. Preserve upward log scrolling when wrapped rows finish measuring.
- b2e70bb: Add keyboard-only focus-ring and focus-ring-inset utilities and migrate kit outlines; upgrade @gntik-ai/tokens to this minor release before copying migrated registry sources.
- Updated dependencies [061c035]
- Updated dependencies [999e562]
- Updated dependencies [7e30223]
- Updated dependencies [87bc7c2]
- Updated dependencies [83304af]
- Updated dependencies [56328a3]
- Updated dependencies [34ab430]
- Updated dependencies [e8c3141]
- Updated dependencies [8ac6dd2]
- Updated dependencies [cf75c90]
- Updated dependencies [68b6d35]
- Updated dependencies [c08a0a1]
- Updated dependencies [52eee4d]
- Updated dependencies [dc1f24f]
- Updated dependencies [5ec552c]
- Updated dependencies [0ad5913]
- Updated dependencies [834d3a8]
- Updated dependencies [e5d1b97]
- Updated dependencies [db3ef71]
- Updated dependencies [01125b0]
- Updated dependencies [8e812fe]
- Updated dependencies [b7ea024]
- Updated dependencies [e12e80a]
- Updated dependencies [3860511]
- Updated dependencies [7bcabbd]
- Updated dependencies [8b4238e]
- Updated dependencies [c9370fd]
- Updated dependencies [217b4e1]
- Updated dependencies [a69fe31]
- Updated dependencies [5e0f529]
- Updated dependencies [e7d905b]
- Updated dependencies [3ffe148]
- Updated dependencies [36ea76d]
- Updated dependencies [5131991]
- Updated dependencies [cd9b1bd]
- Updated dependencies [c064156]
- Updated dependencies [8a8df93]
- Updated dependencies [e545f3e]
- Updated dependencies [b2e70bb]
- Updated dependencies [1eb473d]
- Updated dependencies [18b64f6]
- Updated dependencies [8ea8e6f]
- Updated dependencies [0124118]
  - @gntik-ai/ui@0.12.0
  - @gntik-ai/tokens@0.4.0

## 0.11.0

### Patch Changes

- Updated dependencies [3cad9d6]
- Updated dependencies [b366590]
- Updated dependencies [3b5e0b0]
- Updated dependencies [8379594]
  - @gntik-ai/ui@0.11.0
  - @gntik-ai/tokens@0.3.0

## 0.10.0

### Patch Changes

- 9dd0d8d: Unify locale-aware file sizes across thumbnails, uploads and chat, with binary and bit options, consistent chart unit promotion, and a decimal 25 MB default upload limit.
- Updated dependencies [e130bce]
- Updated dependencies [d05dc61]
- Updated dependencies [77301a9]
- Updated dependencies [609af5a]
- Updated dependencies [9dd0d8d]
  - @gntik-ai/ui@0.10.0

## 0.9.0

### Minor Changes

- 73b19e3: Add an opt-in AgentSurface with a validated, allow-listed kit catalog, data bindings, actions, and localized agent-content groups and focus recovery when content is removed or suppressed.

### Patch Changes

- Updated dependencies [91529bb]
- Updated dependencies [4ab6493]
- Updated dependencies [73b19e3]
- Updated dependencies [53e8909]
- Updated dependencies [e67ab87]
- Updated dependencies [8781fd7]
- Updated dependencies [47c4582]
- Updated dependencies [0ce6f33]
- Updated dependencies [9de4924]
- Updated dependencies [57d8e4e]
- Updated dependencies [39b9e66]
- Updated dependencies [7340188]
  - @gntik-ai/ui@0.9.0

## 0.7.0

### Patch Changes

- Updated dependencies [0e5a63d]
- Updated dependencies [236f8e7]
- Updated dependencies [ccb56cf]
- Updated dependencies [90d8e31]
  - @gntik-ai/ui@0.7.0

## 0.5.0

### Patch Changes

- 5fe9e8e: Publish all packages publicly on npmjs.org; projects should remove any old @gntik-ai:registry line from .npmrc to resolve new versions.
- Updated dependencies [4992a03]
- Updated dependencies [5fe9e8e]
- Updated dependencies [0f55d7b]
- Updated dependencies [7e634c7]
- Updated dependencies [80c9d78]
  - @gntik-ai/ui@0.5.0
  - @gntik-ai/tokens@0.2.1

## 0.3.0

### Patch Changes

- Updated dependencies [08c916d]
- Updated dependencies [6af5fae]
- Updated dependencies [965d2f7]
- Updated dependencies [e51af67]
- Updated dependencies [618926a]
  - @gntik-ai/ui@0.3.0

## 0.2.0

### Minor Changes

- dfb06cf: Chat extras: `TypingIndicator` (three dots, static under reduced motion, "Assistant is typing" for screen readers) and a caret after streamed plain text in `ChatMessage`; `MessageFeedback` (copy, regenerate, thumbs up/down toggles with a reason + comment popover on thumbs down, controlled `value` + `onFeedback`); `AttachmentList` / `AttachmentChip` (image thumbnails, file-type icons, size, upload progress, error with retry, remove) plus `validateFiles` / `matchesAccept`; `ChatComposer` now accepts pasted and dropped files and validates `accept`, `maxSize` and `maxFiles` with messages (`onReject`, `onRetryAttachment`); `ModelPicker` (models grouped by provider, capability and context-size badges, disabled models with a reason, compact trigger for the composer toolbar). New strings live in the `@gntik-ai/ui` en/es catalogs, with English fallbacks for older catalogs. Existing APIs are unchanged; `ComposerAttachment` gains optional `type`, `previewUrl`, `progress` and `error`.
- e07d276: Internationalization and RTL: `I18nProvider` / `useI18n` (English and Spanish catalogs, 290 typed keys, Intl formatters for numbers, currency, dates, relative time and lists; direction from the locale) drive every built-in string — label props still win. Physical utilities became logical ones (`ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`), directional icons mirror, and Drawer `left`/`right`, Resizable and ChatLayout follow `dir`.
- da3c8f1: Kit gaps reported by template authors. ui: new KanbanBoard (controlled `columns` + `onMove`, `moveKanbanCard`; pointer and keyboard drag — Space picks up, arrows move, Space/Enter drops, Escape cancels — with announcements), the dependency-free `useSortable` hook, and LiveAnnouncer + `useAnnounce()` (polite/assertive aria-live regions); StackedLayout gains a `nav` slot (e.g. a MegaMenu) in the top bar; Meter gains `higherIsBetter` to invert its thresholds (low = bad); new i18n keys `kanban.*` and `chat.participant` (en, es). chat: ChatMessage gains the `participant` role (another person in the thread) with a start-aligned outlined bubble, and `avatarSrc` for user/participant avatars.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.

### Patch Changes

- Updated dependencies [cf544b8]
- Updated dependencies [fc405b4]
- Updated dependencies [e07d276]
- Updated dependencies [da3c8f1]
- Updated dependencies [d8de1ff]
- Updated dependencies [cdeb737]
- Updated dependencies [cdeb737]
- Updated dependencies [ad65d0e]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [00f0f06]
- Updated dependencies [e61b1c1]
  - @gntik-ai/tokens@0.2.0
  - @gntik-ai/ui@0.2.0
