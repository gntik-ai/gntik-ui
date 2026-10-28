# Add a collapsible chat reasoning trace

## Why

Reasoning models stream thoughts separately from their answers. The chat pack needs a quiet disclosure with phase labels, safe Markdown and a single thinking announcement instead of reading every token.

## What changes

Add ReasoningBlock to @gntik-ai/chat, using the kit Collapsible primitives and ToolCallCard trigger styling. Uncontrolled blocks open while streaming and settle once to defaultOpen when streaming ends, unless the reader toggled them. Controlled open always wins. Add optional reasoning to ChatAnnouncer, English and Spanish catalog keys with chat fallbacks, a reasoning fixture in ChatDemo, docs examples, tests and generated registry output.

## Scope and risk

- Change id: add-chat-reasoning-block. Capabilities: chat/reasoning-block and chat/chat-announcer. All requirements are ADDED; no baseline exists. No dependencies.
- R1: additive optional API. Revert the change or pin the prior chat/ui packages to roll back. No publication or deployment.
- Do not change formatDuration or ToolCallCard behavior. A separate formatter rounds reasoning durations to whole seconds.
- Do not measure elapsed time inside the block. Without durationMs, show Reasoning.
- Backend production of reasoning chunks, automatic message-part rendering, inline think tags, assistant template integration, token counts and cost remain out of scope.
- Full Markdown reparsing per chunk is accepted; incremental parsing is deferred.
- A scroll regression covers an unpinned reader when reasoning collapses. Browser contrast and rendering checks run in PR CI.
- Release both chat and ui as minor versions: new component/prop and additive catalog keys.
