# ChatComposer slots, submit mode and text actions

## Why

Consumers need quote-reply context, multiline prompts, snippet insertion and selectable read-only drafts without rebuilding the composer.

## What changes

Add optional header, prefix and footer slots, ChatComposerHeader, submitMode, readOnly and actionsRef. Keep default behavior and DOM unchanged, forward ref to the textarea, use useOs only for localized hints, and restore controlled insertion carets after rendering. clear() affects text only. Document and demonstrate the additions with translated examples and changesets for chat (minor) and ui (patch).

## Impact

R1: additive API in chat, catalog keys in ui, documentation and regenerated registry artifacts. No new dependencies. Controlled parents must apply onValueChange synchronously for caret restoration. Roll back by reverting or pinning the previous package releases. Mention menus, voice, page-wide drop and generic Textarea sizing are out of scope.
