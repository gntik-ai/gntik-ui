# Tasks

## 1. Implementation

- [x] 1.1 Export shared zone helpers and retain cron gap/overlap behavior behind its call site.
- [x] 1.2 Add provider and formatter zones, and Timestamp and ScheduleInput defaults.
- [x] 1.3 Add zone-aware scheduling helpers, block props and en/es header messages.

## 2. Tests

- [x] 2.1 Characterize cron DST behavior before extraction and add helper, provider and component tests before source changes.
- [x] 2.2 Add Madrid-runtime month, week, now-line and agenda regression tests.
- [x] 2.3 Add browser accessibility coverage for zone examples in all three themes (runs in PR CI).

## 3. Docs and release

- [x] 3.1 Add live examples, API notes and one minor changeset for ui and blocks.
- [x] 3.2 Regenerate the registry and llms outputs.
- [x] 3.3 Run strict OpenSpec validation and the bounded repository checks; browser suites remain in PR CI.

The network-dependent token mirror-install test cannot obtain tokens-0.2.1.tgz in this worker. Its other token tests pass; PR CI must run the complete mirror test.
