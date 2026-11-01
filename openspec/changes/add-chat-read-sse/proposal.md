# Add readSSE and readTextParts stream readers to the chat pack

## Why

`@gntik-ai/chat` exports UI only, and no package reads a streamed response. Chat replies and live log tails arrive as Server-Sent Events over `fetch`; POST bodies and auth headers rule out `EventSource`, so each product re-implements line splitting, multi-line `data:` and chunk boundaries. The planned `add-chat-use-chat` adapters build on a shared reader.

## What changes

- Add `readSSE(source, { signal, maxBufferSize })` to `@gntik-ai/chat`: an async generator that follows the WHATWG event-stream parsing rules (streaming UTF-8, BOM, CRLF/LF/CR across chunks, comments, multi-line data, persistent `id`, digits-only `retry`).
- Add `readTextParts(source, { separator, signal, maxBufferSize })` for separator-delimited protocols such as NDJSON.
- Abort throws `signal.reason`; abort, early exit and stream errors cancel the reader once. A pending block or part over `maxBufferSize` characters (default 1,048,576) throws a `RangeError`. A `Response` without a body throws a `TypeError`.
- Docs examples for a chat stream with Stop, an NDJSON log tail and a `Last-Event-ID` reconnect loop; tests; a minor changeset; regenerated registry output.

## Scope and risk

- Change id: add-chat-read-sse. Capability: chat/utils/read-sse. All requirements are ADDED; no baseline exists. No dependencies.
- R1: additive, dependency-free, no existing export changes. Roll back by reverting the change or pinning `@gntik-ai/chat` 0.11.0.
- An unterminated final block is dropped, as `EventSource` does, so a server that closes without a blank line loses its last message. The TSDoc says so.
- `maxBufferSize` bounds memory, not time: a stream that never sends a separator stays open until the caller aborts.
- Out of scope: request helpers (timeouts, retries, auth), reconnection, an `EventSource` polyfill, WebSocket transport, chat adapters (`add-chat-use-chat`), wiring the live-event-stream template or LogViewer, and checking `response.ok` or the content type.
- Release through a changesets minor bump only.
