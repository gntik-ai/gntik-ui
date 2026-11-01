## Purpose

Assistant chat template: a console page with a chat thread, suggestions, tool calls, streamed markdown replies with sources, Stop, Retry and feedback, and a details panel.

## ADDED Requirements

### Requirement: Assistant chat runs on a chat adapter

AssistantChatPage SHALL render its conversation from useChat, using the adapter prop when given and otherwise a scripted adapter built from reply, tool and tickMs. The scripted adapter SHALL schedule chunk timers eagerly and clear all timers on abort. Default rendering SHALL preserve list_deployments Running/Succeeded, the reply table, Sources regions and the existing stopped-tool error.

#### Scenario: Custom adapter

- **WHEN** the page renders with an echo adapter and the user sends hello
- **THEN** an assistant reply with the text hello is shown in ChatMessage with Markdown

#### Scenario: No adapter

- **WHEN** the page renders without adapter and a suggestion is chosen
- **THEN** the scripted tool call and reply stream as before
- **AND** existing assertions retain their meaning and order with only async act and timer advancement changes
