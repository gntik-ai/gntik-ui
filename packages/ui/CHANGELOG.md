# @gntik-ai/ui

## 0.12.0

### Minor Changes

- 061c035: Add DownloadButton, downloadFile and safe CSV serialization with spreadsheet formula protection.
- 87bc7c2: Add CSPProvider and useCSP to forward app nonces to inline elements, support disabling style elements, and retain native scrollbar hiding with static classes.
- 834d3a8: Add provider display time zones, DST-safe conversion helpers and zone-aware scheduling calendars while preserving existing runtime and cron behavior.
- cd9b1bd: Add SSR-safe media query and breakpoint hooks with shared breakpoint tokens, and use them for responsive panels and reduced-motion behaviour. Preserve upward log scrolling when wrapped rows finish measuring.

### Patch Changes

- 52eee4d: A rejected contact onSubmit now shows a visitor-facing error with localized default text or submitErrorMessage, preserving form values for another attempt.
- Updated dependencies [cd9b1bd]
  - @gntik-ai/tokens@0.4.0

## 0.11.0

### Minor Changes

- 3cad9d6: Localise built-in form and authentication labels in English and Spanish with typed per-instance overrides.
- b366590: Add localized LogViewer level names, per-level label overrides, and optional full-message wrapping with measured rows.
- 3b5e0b0: Add ThemeScope with themed overlays, per-scope color schemes and ThemeProvider forcedMode; the new .light selector also applies kit tokens to existing elements using that class.

### Patch Changes

- 8379594: Keep server-mode selected ids across pages in onSelectionChange and bulkActions (preserveSelection={false} restores page-only reporting); add localized select-all-matching models, disabled multiple-selection rows, hideSelectAll and paginated single selection. Keep matching-selection announcements in a persistent live region, preserve the default announcement surface and restore keyboard focus when clearing.
- Updated dependencies [3b5e0b0]
  - @gntik-ai/tokens@0.3.0

## 0.10.0

### Minor Changes

- 609af5a: Localize batch-1 console labels in English and Spanish with optional per-key overrides; the expanded Messages type requires full custom catalogs to add the new keys, and blocks, templates and ui must release together.

### Patch Changes

- e130bce: Show platform-aware shortcut hints with useOs and the mod key token.
- d05dc61: Flag inverted number and date ranges in QueryBuilder and skip them during evaluation, leaving more records visible instead of matching none.
- 77301a9: Follow provider or runtime week starts and clocks in scheduling blocks, add weekend attributes and overrides, and export localeWeekStart; without a provider, en-US runtimes now use Sunday-first weeks and 12-hour times (pass weekStartsOn={1} and hourCycle="h23" to retain the previous layout).
- 9dd0d8d: Unify locale-aware file sizes across thumbnails, uploads and chat, with binary and bit options, consistent chart unit promotion, and a decimal 25 MB default upload limit.

## 0.9.0

### Minor Changes

- 91529bb: Add FieldArray to the optional forms entry for repeatable object fields with accessible actions, validation, focus management and English/Spanish messages.
- 4ab6493: Add PeriodPicker and inline PeriodCalendar for whole ISO weeks, months, quarters and years, with ranges, translated presets and keyboard navigation.
- 53e8909: Add clickable Calendar headings for month and year navigation, controlled views and select captions that preserve each panel and respect today; set maxView="day" on Calendar or date pickers to keep the previous static heading. Keep adjacent-month dates readable in all themes.
- e67ab87: Add opt-in clear buttons and keyboard resets to text inputs, optional selects, date pickers and time pickers.
- 47c4582: Add opt-in form control bindings, form-wide field props, width presets and focus refs for selects and pickers.
- 57d8e4e: Add locale-ordered DateField and DateRangeField with keyboard entry, date-time segments, validation, paste and form submission.
- 39b9e66: Add an optional full-width name and email trigger for UserMenu in sidebar footers.
- 7340188: Add opt-in virtualized option lists to Combobox, MultiSelect and TransferList with accessible keyboard navigation and full-data bulk actions.

### Patch Changes

- 73b19e3: Add an opt-in AgentSurface with a validated, allow-listed kit catalog, data bindings, actions, and localized agent-content groups and focus recovery when content is removed or suppressed.
- 8781fd7: Match text without accents or case in kit searches and filters, and highlight the original text at correct Unicode offsets.
- 0ce6f33: Read built-in component labels and PageHeader section names from the active English or Spanish catalog while preserving caller overrides.
- 9de4924: Format default table cells in the provider locale, with customizable boolean labels and English and Spanish yes/no catalog entries.

## 0.7.0

### Minor Changes

- 0e5a63d: Add caller-defined wizard flows with localized labels, validation, abortable submit states and accessible navigation locks.
- 236f8e7: Add stateless cursor pagination and a responsive cursor pager footer with accessible busy states, optional counts and page-size selection.
- ccb56cf: Add an accessible load-more footer for cursor and flag lists with translated labels, retry, focus retention and append announcements.

### Patch Changes

- 90d8e31: Name the open Select listbox after its trigger's label.

## 0.5.0

### Minor Changes

- 4992a03: Add optional JsonViewer display caps with Unicode-safe text fallback, truncation labels, full-value copying and capped empty content.
- 0f55d7b: Add read-only profile settings with identity, context and roles; reserve SettingsLayout saveBar='none' as an explicit wrapper opt-out (the literal previously rendered as text).
- 80c9d78: Add a non-interactive truncated collection footer with localized exact counts, lower-bound counts and truncation notes.

### Patch Changes

- 5fe9e8e: Publish all packages publicly on npmjs.org; projects should remove any old @gntik-ai:registry line from .npmrc to resolve new versions.
- 7e634c7: Add opt-in single row selection to non-paginated DataTable with native radios, accessible labels including numeric legends, keyboard navigation that preserves table controls and pointer focus, disabled choices, a localized selection column and resize handles that avoid unnecessary scroll-container tab stops.
- Updated dependencies [5fe9e8e]
  - @gntik-ai/tokens@0.2.1

## 0.3.0

### Minor Changes

- 08c916d: Add a credential disclosure dialog with masked stored values, fresh-secret warnings, translated copy feedback and validated focus return.
- 6af5fae: Ship a generated external theme bootstrap and document synchronous same-origin loading for strict CSP.
- 965d2f7: Add a status heading slot and title focus refs so PageHeader can supply the only h1 on a not-found page.
- e51af67: Add an accessible StatusTimeline empty state and localizable labels with English and Spanish defaults.
- 618926a: Add accessible fullscreen and dialog wizard overlays, a dialog-wizard block, and an in-page create-wizard demo.

## 0.2.0

### Minor Changes

- cf544b8: Density modes: `density.css` tokens and Tailwind utilities (`h-control`, `h-row`…), `DensityProvider`/`useDensity` (`compact | comfortable`), and `size: 'auto'` defaults so controls, tables and tabs follow the active density.
- fc405b4: `falconePreset` (placeholder monogram until the Falcone logo lands); `gntik-ui init --brand falcone`.
- e07d276: Internationalization and RTL: `I18nProvider` / `useI18n` (English and Spanish catalogs, 290 typed keys, Intl formatters for numbers, currency, dates, relative time and lists; direction from the locale) drive every built-in string — label props still win. Physical utilities became logical ones (`ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`), directional icons mirror, and Drawer `left`/`right`, Resizable and ChatLayout follow `dir`.
- da3c8f1: Kit gaps reported by template authors. ui: new KanbanBoard (controlled `columns` + `onMove`, `moveKanbanCard`; pointer and keyboard drag — Space picks up, arrows move, Space/Enter drops, Escape cancels — with announcements), the dependency-free `useSortable` hook, and LiveAnnouncer + `useAnnounce()` (polite/assertive aria-live regions); StackedLayout gains a `nav` slot (e.g. a MegaMenu) in the top bar; Meter gains `higherIsBetter` to invert its thresholds (low = bad); new i18n keys `kanban.*` and `chat.participant` (en, es). chat: ChatMessage gains the `participant` role (another person in the thread) with a start-aligned outlined bubble, and `avatarSrc` for user/participant avatars.
- d8de1ff: First component release: `@gntik-ai/ui` P1 components on Base UI with ThemeProvider and brand presets; icons, charts, flow and editor packages; contrast-safe pairing aliases and the runtime token adapter in `@gntik-ai/tokens`.
- cdeb737: SSR-safe theming and adoption fixes from the example apps: `@gntik-ai/ui/theme-script` (server-importable `themeScript`), ThemeProvider `initialMode` with hydration-safe storage reads, Timestamp `now`; charts default to `hsl(var(--token))` colours (`useChartTheme({ resolved: true })` for concrete values); ConsoleShell forwards sidebar options; every console template takes `shell`; resource-index and home-dashboard are data-generic; template data types and the settings frame/nav are exported.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.
- dfb06cf: DiffViewer (split/unified line diff with word highlights, collapsed context, JSON with stable key order; exports `diffLines`, `diffWords`, `diffJson`), SecretField (masked value, reveal, copy, rotate with confirmation, created/last-used meta), KeyValueEditor (validated key/value rows, secret rows, `.env` paste and export), CopyButton (`copyToClipboard` with execCommand fallback) and SplitButton (action + Menu).
- dfb06cf: New form components: PermissionMatrix (roles × permissions grid, tri-state allowed / denied / inherited cells with icon + text, read-only columns, per-cell disabled reasons, grid keyboard navigation), QueryBuilder (nested AND/OR groups of typed conditions, plus `queryToString` and `evaluateQuery`), ScheduleInput (cron presets + raw field, validation, plain-language summary and next runs in a time zone, plus `parseCron`, `describeCron`, `nextRuns`), TimePicker (hour/minute/second spinbutton segments, 12/24h by locale, step) and DateTimeRangePicker (relative presets, "Last N" and absolute date + time ranges). DatePicker gains an optional `withTime` (with `hourCycle`, `timeStep`, `withSeconds`); its existing API is unchanged.
- dfb06cf: Async + creatable selects, toast actions and promises, a forms adapter and Terminal.

  - Combobox, MultiSelect: `loadOptions(query, { signal })` (debounced, stale requests aborted, announced loading / error states with a keyboard-reachable Retry row, empty message) and `onCreate(input)` with a "Create “…”" option. SimpleSelect: `loadOptions` on first open with loading / empty / error states (reopening retries), `items` now optional, `triggerRef`. New `useAsyncOptions` hook.
  - Toast: `dismissAction` next to the primary `action`, a `loading` tone, and `toast.promise(task, { loading, success, error })` that updates one toast in place (errors announced assertively).
  - New `@gntik-ai/ui/forms` entry: `FormField`, `Form`, `useFieldProps` and a dependency-free `schemaResolver` (zod-compatible) wiring react-hook-form state into Field (label, description, error, aria-invalid, aria-describedby, focus on first invalid). react-hook-form and zod are optional peer dependencies.
  - New Terminal: streamed output with ANSI colours mapped to tokens (`parseAnsi`, `stripAnsi`, `ansiClassName`), tail following with "Jump to latest", line numbers, timestamps, wrap, copy all, search highlight, max line buffer, `role="log"` with opt-in aria-live.

  **Behaviour change:** `useToast().promise` is now the kit helper: it takes `{ loading, success, error }` as strings, `ToastOptions` or functions of the result, with kit `tone`s, instead of Base UI's `type` / `actionProps` options. It still returns the original promise.

- 00f0f06: ContextMenu (Shift+F10 / context key), Timer, Thumbnail + ThumbnailList, OverflowList ("+N more"), TreeList (WAI-ARIA tree, async children) and JsonViewer.
- e61b1c1: PowerSearch (structured filters, experimental), ListInput, VirtualList, TransferList, Tour, BottomSheet, Lightbox, Carousel, Blockquote and MegaMenu.

### Patch Changes

- Updated dependencies [cf544b8]
- Updated dependencies [d8de1ff]
- Updated dependencies [cdeb737]
- Updated dependencies [ad65d0e]
  - @gntik-ai/tokens@0.2.0
