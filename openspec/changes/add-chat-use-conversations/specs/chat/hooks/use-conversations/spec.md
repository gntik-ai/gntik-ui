## Purpose

useConversations manages local chat summaries, active selection and message histories beside useChat.
ChatConversation reuses ConversationSummary with id and required updatedAt, adding optional metadata.

## ADDED Requirements

### Requirement: Conversations can be added, patched, removed and replaced by id

The hook SHALL default to an empty list. addConversation SHALL prepend by default, append with
'append', and return false without changes for duplicate ids. setConversation SHALL accept a patch
or updater receiving the current conversation and SHALL preserve id. Unknown ids SHALL be no-ops.
getConversation SHALL return the current summary or undefined. setConversations SHALL replace the list.
onConversationsChange SHALL fire exactly once per successful mutation, never on mount or a no-op,
including in StrictMode. Callbacks SHALL NOT run inside React state updaters.

#### Scenario: Add and duplicate

- **GIVEN** c1 and c2
- **WHEN** c3 with title New chat and an updatedAt value is added
- **THEN** the list is c3, c1, c2 and the result is true
- **AND** with append the list is c1, c2, c3
- **AND** adding c1 again returns false and retains the list identity

#### Scenario: Rename

- **WHEN** c1 is patched with title Renamed
- **THEN** only c1 changes and its id stays c1
- **AND** an updater receives the current c1
- **AND** an unknown id does not invoke the updater or callback

### Requirement: Selection supports controlled and uncontrolled activeId

The hook SHALL initialize uncontrolled selection from defaultActiveId (default null). Controlled
activeId SHALL pass through, even when absent from the list. setActiveId SHALL ignore unknown ids
and report valid changes through onActiveChange; controlled selection SHALL wait for the prop.
Removing the active item SHALL request the next item in list order, else previous, else null.

#### Scenario: Controlled switch

- **GIVEN** controlled activeId c1
- **WHEN** setActiveId is called with c2
- **THEN** onActiveChange receives c2 and activeId stays c1 until the prop changes
- **AND** requesting missing invokes no callback

#### Scenario: Removal fallback

- **GIVEN** c1, c2, c3 with c2 active
- **WHEN** c2 is removed
- **THEN** c3 becomes active
- **AND** removing c3 selects c1 and removing c1 selects null
- **AND** onActiveChange receives each new value
- **AND** removing a non-active item leaves selection unchanged

### Requirement: Message histories are non-reactive and isolated

Each instance SHALL store generic messages (default ChatThreadMessage) in a ref Map. setMessages
SHALL retain the supplied array identity without rendering the host. Missing ids SHALL return the
same module-level frozen empty array. removeConversation SHALL delete its messages. Instances SHALL
keep separate lists and maps. TSDoc SHALL mark the API experimental, explain non-reactivity, and
recommend preview/updatedAt for list previews. The hook SHALL NOT stamp timestamps.

#### Scenario: Store and remove

- **WHEN** messages m are stored under c1
- **THEN** getMessages(c1) returns m without a host render
- **AND** after removing c1 it returns the shared frozen empty array

#### Scenario: Example restores histories

- **GIVEN** the documented example with createEchoAdapter
- **WHEN** a message is sent in c1, then c2 is selected, then c1 is selected
- **THEN** c1's messages are restored and c2 never contains c1's messages
- **AND** write-back tracks the owning id across useChat's effect-based reset
