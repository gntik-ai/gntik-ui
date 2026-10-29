# Change: Add shared storage state hooks

## Why

Kit consumers need supported persistent state without adding another hooks library. SidebarLayout and Resizable duplicate storage access, and reading stored state during the initial render can disagree with server markup.

## What changes

- Export useLocalStorage, useSessionStorage, readLocalStorageValue and UseStorageOptions from @gntik-ai/ui.
- Share subscriptions per storage/key using useSyncExternalStore, default server snapshots and cached parsed values.
- Support codecs, validation, same-document updates, optional localStorage cross-tab sync, error callbacks and memory fallbacks.
- Adopt the hooks in SidebarLayout and Resizable with unchanged public props, keys and stored formats. Keep drag updates local until explicitly persisted.
- Add public-seam tests, a live catalog example, a UI minor changeset and regenerated registry output.

## Scope and risk

Issue #137, risk R1. No runtime dependencies or migrations. ThemeProvider, themeScript, a separate hooks entry, DataTable state, SplitLayout and ConsoleShell are outside this change. SSR layouts may show the default briefly before restoring storage. Invalid sidebar values now use the supplied default. Consumers should use prefixed keys and consistent types/codecs. Rollback is a revert or a previous UI version pin. No deployment or publication.
