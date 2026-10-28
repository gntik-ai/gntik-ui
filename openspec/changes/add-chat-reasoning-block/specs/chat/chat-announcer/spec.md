## Purpose

A single polite status region for thinking, responding and the finished reply, without announcing reasoning tokens.

## ADDED Requirements

### Requirement: Thinking is announced separately from responding

ChatAnnouncer SHALL accept optional reasoning (false by default). While streaming and reasoning are true it SHALL announce chat.thinkingStatus once per phase, then the existing chat.responding when reasoning turns false, then the completed lastReply once streaming ends. It MUST NOT include reasoning text during either streaming phase. chat.thinkingStatus SHALL use the chat English fallback for older catalogs; chat.responding and chat.assistant SHALL retain their existing translation behavior.

#### Scenario: Thinking then answering

- **GIVEN** streaming and reasoning are true
- **WHEN** reasoning turns false while streaming stays true
- **THEN** the status first reads Assistant is thinking…
- **AND** it now reads Assistant is responding…
- **AND** streaming-token changes do not change the phase status
- **AND** finishing the stream announces only the completed reply

#### Scenario: Existing consumers

- **WHEN** reasoning is omitted
- **THEN** the responding and completed-reply behavior remains unchanged

#### Scenario: Localized author and fallback

- **GIVEN** an es provider or a catalog missing chat.thinkingStatus
- **WHEN** reasoning streams
- **THEN** the thinking message uses the catalog or English fallback respectively
- **AND** the author still resolves from the explicit author or chat.assistant
