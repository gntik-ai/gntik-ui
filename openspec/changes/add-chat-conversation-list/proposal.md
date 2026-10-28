# Add presentational conversation history

## Why

The chat package has no reusable history list or inline-start history slot. The messaging template duplicates a list with separate Tab stops and no recency grouping, row menus or incremental loading.

## What changes

Add ConversationList with local-calendar grouping, controlled/uncontrolled selection and disclosures, roving keyboard navigation, sibling MoreMenu actions, inline rename, unread badges, New chat, load more and measured windowing. Add optional sidebar/sidebarWidth to ChatLayout and replace the messaging template's inline list. Include English and Spanish catalogs and older-catalog fallbacks, interactive docs examples, tests, generated registries and one changeset.

## Scope and risk

- Change id: add-chat-conversation-list. Capabilities: chat/conversation-list and chat/chat-layout. All requirements are ADDED; no baseline exists. No dependencies.
- R1, additive. Without sidebar, ChatLayout preserves the original DOM. Applications own persistence, loading, deletion confirmation, shortcuts and mobile Drawer state.
- Grouping uses local calendar dates against now; supply a stable now for SSR across midnight. Measured heights can change scroll geometry; estimates and small overscan bound the mounted window while retaining the tab stop.
- Assistant-chat and ChatBox adoption, search, filtering, pinning, folders, drag reordering and automatic responsive drawers are out of scope.
- Roll back by reverting the commit or pinning the previous chat release. No deployment, publication or merge is part of this change.
