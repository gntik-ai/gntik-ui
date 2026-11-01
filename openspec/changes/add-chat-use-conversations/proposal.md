# Add useConversations local conversation state

## Why

The chat package provides useChat and ConversationList, but products still manage conversation
lists, selection and per-conversation message histories themselves.

## What changes

- Add experimental useConversations and ChatConversation to @gntik-ai/chat.
- Reuse ConversationSummary with id and required updatedAt (Date | string | number), plus metadata.
- Support adding, patching, removing, replacing and reading summaries, controlled or uncontrolled
  activeId/onActiveChange, and non-reactive per-conversation messages in an instance-local ref Map.
- Add a live echo example that restores histories without writing stale useChat messages to a new id,
  public API tests, a minor changeset and regenerated registries.

## Scope and risk

- Change id: add-chat-use-conversations. Capability: chat/hooks/use-conversations (ADDED).
- Depends on add-chat-use-chat. Applies the 2026-11-01 operator amendment: id/activeId, existing types,
  required updatedAt, and no onMessagesChange.
- R1: additive hook. Revert or pin the previous chat package to roll back.
- No changes to useChat, ConversationList or templates. No persistence, backend contract,
  cross-tab synchronization, publication or deployment.
