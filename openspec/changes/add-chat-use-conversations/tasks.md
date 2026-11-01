# Tasks

## 1. Implementation

- [x] 1.1 Add experimental hook, existing-type-based ChatConversation and alphabetical public export.
- [x] 1.2 Add list mutations, controlled/uncontrolled selection and ref-backed message storage.
- [x] 1.3 Add TSDoc and a catalog echo example with an owning-id guard for message write-back.

## 2. Tests

- [x] 2.1 Exercise adds, patches, removals, selection and callbacks through renderHook, red before green.
- [x] 2.2 Exercise frozen empty identity, non-rendering message storage, cleanup and instance isolation.
- [x] 2.3 Verify echo history restoration and jsdom axe in all three themes.
- [x] 2.4 Run bounded library builds/tests, lint, typecheck, registry and kit-only checks.
- [ ] 2.5 Browser suites run in PR CI.

## 3. Docs and release

- [x] 3.1 Add one minor changeset for @gntik-ai/chat.
- [x] 3.2 Regenerate registry outputs and verify docs coverage.
- [x] 3.3 Run openspec validate add-chat-use-conversations --strict.

## Worker validation limits

The tokens mirror-install test needs registry access. In this offline worker its fallback raised
ENOENT for gntik-ai-tokens-0.2.1.tgz; the remaining twelve token test files passed separately.
Browser suites, Next.js app builds, MCP CLI tests and evals tests run in PR CI per the worker policy.
