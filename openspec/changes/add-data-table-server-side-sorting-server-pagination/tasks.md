# Tasks

## 1. Implementation

- [x] 1.1 Keep handled server sorting and request page 1 on sort changes, including saved views.
- [x] 1.2 Export DataTableQuery and emit one synchronous next query per action, combining footer resize callbacks without changing PaginationFooter's API.
- [x] 1.3 Update prop documentation, metadata and the server example with controlled sort reset on failure.

## 2. Tests

- [x] 2.1 Write and run failing rendered server tests before implementing each behavior: headers, query payloads, controlled sort, pagination and saved views.
- [x] 2.2 Write and run failing client query tests before implementing sort, page, resize and saved-view notifications.
- [x] 2.3 Add an example integration/axe test and extend browser accessibility coverage for sorting in all three themes.

## 3. Docs and release

- [x] 3.1 Add one minor blocks changeset noting newly visible server sort buttons.
- [x] 3.2 Regenerate registry artifacts.
- [x] 3.3 Validate OpenSpec and run permitted repository checks (tokens mirror-install is unavailable offline).
- [ ] 3.4 Run browser accessibility suites in PR CI (worker policy).

## 4. Checker follow-up

- [x] 4.1 Reproduce the empty server resize double query, then mirror the footer's unclamped page comparison and verify the complete query and legacy callback order.
- [x] 4.2 Reproduce saved-view page resets without sort handlers, then gate sort changes on handled sorting.
- [x] 4.3 Reproduce stale responses and stale sort rollback in the server example; guard request completion by request id and retain the latest confirmed sort. Exercise deferred endpoint responses through the rendered example.
- [x] 4.4 Re-run strict OpenSpec validation with the installed CLI.
