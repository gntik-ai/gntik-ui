## Purpose

useClipboard: copies text with the kit's Clipboard API and execCommand fallback, and exposes copied, failed and error state for custom copy actions.

## ADDED Requirements

### Requirement: Copy resolves to a success flag and never rejects

`copy(value)` SHALL write the text, or the result of the getter, through `copyToClipboard` and SHALL resolve `true` on success and `false` on failure, including a throwing getter. It MUST NOT reject.

#### Scenario: Fallback succeeds

- **GIVEN** `navigator.clipboard.writeText` rejects
- **AND** `document.execCommand('copy')` returns true
- **WHEN** `copy('abc')` is called
- **THEN** it resolves true
- **AND** `status` is copied

#### Scenario: Both paths fail

- **WHEN** `copy('abc')` is called and neither path can write
- **THEN** it resolves false
- **AND** `status` is failed and `error` is set
- **AND** `onError` was called once

### Requirement: Copied and failed states last for the timeout and the latest copy wins

After a copy, `status` SHALL stay `copied` or `failed` for `timeout` ms (default 2000) and then return to `idle`; a new copy SHALL restart the timer, a stale result MUST NOT overwrite the state of a later call, and `reset()` SHALL clear it at once.

#### Scenario: Repeated copy

- **WHEN** `copy` is called twice 500 ms apart
- **THEN** `copied` stays true until 2000 ms after the second call

#### Scenario: Out-of-order results

- **WHEN** the first copy resolves after the second
- **THEN** the state reflects the second call

### Requirement: Copy results can be announced through LiveAnnouncer

With `announce: true` and a LiveAnnouncer above, the hook SHALL announce success politely with `common.copiedToClipboard` and failure assertively with `common.copyFailed`; without a LiveAnnouncer it SHALL announce nothing and still copy.

#### Scenario: Menu item copy

- **GIVEN** a LiveAnnouncer and `useClipboard({ announce: true })`
- **WHEN** a Copy ID menu item calls `copy('run_42')`
- **THEN** Copied to clipboard is announced politely

### Requirement: Kit copy affordances share the clipboard path and report only real copies

Kit components, blocks, chat parts and templates SHALL write to the clipboard only through `copyToClipboard` or `useClipboard`, and SHALL show a copied state only after a successful write.

#### Scenario: Failed copy in a log line

- **GIVEN** no clipboard path can write
- **WHEN** the user copies a LogViewer line
- **THEN** the line does not show its copied state

#### Scenario: No Clipboard API

- **GIVEN** `navigator.clipboard` is undefined
- **WHEN** the user copies a DescriptionListCard value
- **THEN** the value is copied through the fallback
- **AND** the copied state shows
