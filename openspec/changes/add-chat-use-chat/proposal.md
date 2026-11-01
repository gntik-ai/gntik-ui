# Add useChat streaming runtime and backend adapters

## Why

The chat package has UI and a public readSSE utility but no conversation runtime. Products otherwise rebuild message state, streaming, cancellation, regenerate and history paging. The assistant template currently owns a timer replay.

## What changes

- Add experimental useChat, ChatThreadMessage, ChatMessagePart, ChatChunk, ChatAdapter and pure applyChunk to @gntik-ai/chat.
- Add tree-shakable echo, HTTP UI-message-stream v1 and OpenAI-compatible chat-completions adapters. Both SSE adapters reuse public readSSE and reject non-OK responses before reading. The URL is the product backend; provider keys remain server-side.
- Add an optional adapter to AssistantChatPage and move the existing eager timer replay into an abortable scripted adapter, preserving its tool, Markdown, sources, Stop and Retry behavior. Existing tests change only asynchronous timing mechanics.
- Document backend proxy integration, protocol, status/part mapping and paging; add live examples and tests, one minor changeset for chat and templates, and regenerate the registry.

## Scope and risk

- Change id: add-chat-use-chat. Capabilities: chat/hooks/use-chat and templates/assistant-chat. ADDED only; there is no baseline. Depends on add-chat-read-sse.
- R1: additive, no runtime dependencies. Roll back by reverting or pinning the previous chat/templates release.
- Busy sends are ignored, never queued. The model ships experimental because it will underpin future compositions.
- No changes to ChatDemo, readSSE or existing component APIs. No part registry, server persistence, provider SDK, resume, new tool approval, inline retry UI or reasoning disclosure API. No publishing, deployment or workflow changes.
- Browser axe suites run in PR CI; worker tests exercise the examples in all three theme scopes with jsdom axe (without computed color contrast).
