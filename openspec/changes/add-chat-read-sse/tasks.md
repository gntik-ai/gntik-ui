# Tasks

## 1. Implementation

- [x] 1.1 Add packages/chat/src/readSSE/ (`readSSE`, `readTextParts`, `SSEMessage`) and export it from packages/chat/src/index.ts.
- [x] 1.2 Document the chat-stream and log-tail usage, the abort pattern and a `Last-Event-ID` reconnect loop on the docs site.

## 2. Tests

- [x] 2.1 readSSE.test.ts: the WHATWG parsing cases, every split point of a sample body, BOM, CR-only endings, `id` persistence and U+0000, `retry`, unterminated final block, abort and `break` cancelling the reader, `maxBufferSize`, `null` body, and `readTextParts` over NDJSON.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/chat`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-chat-read-sse --strict`.
