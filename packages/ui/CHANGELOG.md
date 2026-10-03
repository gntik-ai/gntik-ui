# @gntik-ai/ui

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
