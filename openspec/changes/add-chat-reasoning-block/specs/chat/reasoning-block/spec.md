## Purpose

A collapsible thinking trace inside an assistant turn, above the answer Markdown, with quiet streaming and elapsed-time labels.

## ADDED Requirements

### Requirement: Streaming controls only an untouched uncontrolled disclosure

An uncontrolled ReasoningBlock SHALL open when streaming begins and SHALL settle once to defaultOpen (false by default) on the true-to-false transition, unless the user toggled it during that stream. A controlled open MUST NOT be changed by streaming. onOpenChange SHALL fire only on user toggles.

#### Scenario: Answer starts

- **GIVEN** an uncontrolled streaming block
- **WHEN** streaming turns false
- **THEN** aria-expanded is false and onOpenChange has not fired

#### Scenario: User choice wins

- **GIVEN** the user collapsed and reopened a streaming block
- **WHEN** streaming ends
- **THEN** it stays open
- **AND** a subsequent stream resets the one-time settlement

#### Scenario: Controlled disclosure

- **GIVEN** open is controlled
- **WHEN** streaming changes
- **THEN** aria-expanded continues to match open
- **AND** only user toggles call onOpenChange

### Requirement: Labels describe the phase and whole-second elapsed time

The trigger SHALL use chat.thinking while streaming, chat.thoughtFor with durationMs once completed, and chat.reasoning otherwise. label SHALL override each phase. Elapsed time SHALL round to whole seconds and use the minutes-and-padded-seconds form from one minute onward. The existing formatDuration MUST NOT change.

#### Scenario: Elapsed labels

- **WHEN** completed blocks have durationMs of 12000 and 65000
- **THEN** they read Thought for 12 s and Thought for 1 m 05 s respectively

#### Scenario: No duration or custom label

- **WHEN** completed text has no durationMs
- **THEN** the trigger reads Reasoning
- **AND** an explicit label replaces the generated label

#### Scenario: Spanish and older catalogs

- **GIVEN** an es I18nProvider
- **WHEN** a block streams and then completes with durationMs of 12000
- **THEN** it reads Pensando… and then Pensó durante 12 s
- **AND** a catalog missing the new keys uses the English chat fallback

### Requirement: Empty completed reasoning renders nothing

Completed reasoning that is absent, empty or whitespace SHALL render no element. Streaming reasoning without text SHALL render only the trigger, with aria-expanded true by default, without a panel or a dangling aria-controls reference.

#### Scenario: No reasoning tokens

- **WHEN** a streaming block has no children
- **THEN** Thinking… is the only content
- **AND** the completed empty or whitespace block renders nothing

### Requirement: The running label respects motion preferences

The running label SHALL use animate-pulse and motion-reduce:animate-none. Styling SHALL use token classes, an inline-start body border and muted smaller text, with no shimmer, gradients, glow, palette colors or dark variants.

#### Scenario: Reduced motion

- **GIVEN** reduced motion is preferred
- **WHEN** reasoning streams
- **THEN** the running label's animation is disabled

### Requirement: The body uses safe streaming Markdown and accessible disclosure controls

String children SHALL render through the pack Markdown with streaming passed through; other React nodes SHALL render as provided. The panel SHALL have aria-busy while streaming. ReasoningBlock MUST NOT create a live region. Enter and Space SHALL toggle the disclosure and Tab SHALL reach links in an open panel.

#### Scenario: Unsafe URL and partial code fence

- **WHEN** a streaming string includes a javascript URL and an unclosed code fence
- **THEN** the unsafe URL produces no link and the fence renders as code

#### Scenario: Keyboard and scroll

- **GIVEN** an open panel containing a link in an unpinned ChatLayout
- **WHEN** Tab is pressed
- **THEN** the link can receive focus
- **AND** automatic collapse leaves the unpinned scroll position unchanged

#### Scenario: Accessible examples

- **WHEN** the live examples render in dark, light and high_contrast
- **THEN** axe reports no violations
