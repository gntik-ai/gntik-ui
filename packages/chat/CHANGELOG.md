# @gntik-ai/chat

## 0.3.0

### Patch Changes

- Updated dependencies [08c916d]
- Updated dependencies [965d2f7]
- Updated dependencies [e51af67]
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
