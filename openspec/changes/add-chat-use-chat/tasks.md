# Tasks

## 1. Implementation

- [x] 1.1 Add experimental useChat types, pure applyChunk, hook and public exports.
- [x] 1.2 Add echo, HTTP and OpenAI-compatible adapters using public readSSE.
- [x] 1.3 Add the optional template adapter and move eager timers into data.ts.
- [x] 1.4 Add the localized integration guide with backend proxy, protocol, status and part mapping.

## 2. Tests

- [x] 2.1 Test protocol reduction, immutable merging, tools, deduplication and unknown chunks.
- [x] 2.2 Test send, stop, unmount, failures, busy guard, regenerate, paging, id reset and flush batching.
- [x] 2.3 Test recorded SSE fixtures, HTTP failures and request bodies.
- [x] 2.4 Add the template echo case; retain existing assertions with timing-only amendments.
- [x] 2.5 Run jsdom axe on the live example in all three themes.
- [ ] 2.6 Run browser axe/visual suites in PR CI (worker execution prohibited).

## 3. Docs and release

- [x] 3.1 Add one minor changeset for chat and templates.
- [x] 3.2 Regenerate the registry and run bounded repository checks (tokens mirror install requires CI network; remaining library tests run separately).
- [x] 3.3 Run openspec validate add-chat-use-chat --strict.
