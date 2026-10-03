---
"@gntik-ai/ui": minor
"@gntik-ai/chat": minor
---

Kit gaps reported by template authors. ui: new KanbanBoard (controlled `columns` + `onMove`, `moveKanbanCard`; pointer and keyboard drag — Space picks up, arrows move, Space/Enter drops, Escape cancels — with announcements), the dependency-free `useSortable` hook, and LiveAnnouncer + `useAnnounce()` (polite/assertive aria-live regions); StackedLayout gains a `nav` slot (e.g. a MegaMenu) in the top bar; Meter gains `higherIsBetter` to invert its thresholds (low = bad); new i18n keys `kanban.*` and `chat.participant` (en, es). chat: ChatMessage gains the `participant` role (another person in the thread) with a start-aligned outlined bubble, and `avatarSrc` for user/participant avatars.
